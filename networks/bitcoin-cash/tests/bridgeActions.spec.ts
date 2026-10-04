import { afterEach, describe, expect, it, vi } from 'vitest';

import { TokenMap } from '@rosen-bridge/tokens';

import { generateBitcoinCashUnsignedLock } from '../src/generateUnsignedTx';
import {
  type BitcoinCashBridgeActionConfig,
  createBitcoinCashBridgeActions,
} from '../src/server/bridgeActions';
import { parentOutput, signIntent, signingIntent } from './mocked/signing.mock';

const { candidate } = vi.hoisted(() => ({ candidate: { index: 10 } }));
vi.mock('@rosen-ui/constants', async () => {
  const actual = await vi.importActual<typeof import('@rosen-ui/constants')>('@rosen-ui/constants');
  return {
    ...actual,
    NETWORKS: {
      ...actual.NETWORKS,
      'bitcoin-cash': {
        ...actual.NETWORKS['bitcoin-cash'],
        get index() {
          return candidate.index;
        },
      },
    },
  };
});

/** Trusted three-decimal quote and native parent fixtures; no endpoint is contacted. */
const fixture = async () => {
  const map = new TokenMap();
  const native = {
    tokenId: 'bch',
    name: 'BCH',
    type: 'native',
    residency: 'native',
    decimals: 8,
    extra: {},
  };
  await map.updateConfigByJson([
    {
      'bitcoin-cash': native,
      ergo: {
        ...native,
        tokenId: '11'.repeat(32),
        type: 'token',
        residency: 'wrapped',
        decimals: 3,
      },
    },
  ]);
  const fees = {
    bridgeFee: 1n,
    networkFee: 1n,
    feeRatio: 0n,
    feeRatioDivisor: 10000n,
    rsnRatio: 0n,
    rsnRatioDivisor: 1n,
  };
  const config = {
    policy: {
      lockAddress: signingIntent().lockAddress,
      feeRate: 2,
      maxFee: 10000n,
      allowedDestinationChains: ['ergo'],
    },
    minimumFeeNFT: '22'.repeat(32),
    nextHeightInterval: 1,
    getTokenMap: async () => map,
    calculateFee: vi.fn(async () => ({ fees, nextFees: fees })),
    reader: {
      getSpendableUtxos: vi.fn(async () => [parentOutput(1, 500000n)]),
      getAddressAssets: vi.fn(async () => ({ nativeToken: 500000n, tokens: [] })),
    },
    submitter: { submit: vi.fn(async () => 'aa'.repeat(32)) },
  } satisfies BitcoinCashBridgeActionConfig;
  const request = {
    fromAddress: signingIntent().fromAddress,
    amount: 300000n,
    toChain: 'ergo',
    toAddress: '9iMjQx8PzwBKXRvsFUJFJAPoy31znfEeBUGz8DRkcnJX4rJYjVd',
    bridgeFee: 1n,
    networkFee: 1n,
  };
  return { config, fees, map, request };
};
afterEach(() => {
  candidate.index = 10;
  vi.restoreAllMocks();
});

describe('createBitcoinCashBridgeActions', () => {
  /**
   * @target createBitcoinCashBridgeActions rejects invalid %s
   * @dependencies Explicit operator fixture and isolated index candidate.
   * @scenario Independently remove assignment, replace NFT, fee rate or allowed routes.
   * @expected Reject construction without quote or provider reads.
   */
  it.each(['index', 'nft', 'rate', 'route'])('rejects invalid %s', async (mutation) => {
    const { config } = await fixture();
    if (mutation === 'index') candidate.index = -1;
    if (mutation === 'nft') config.minimumFeeNFT = 'client-token';
    if (mutation === 'rate') config.policy.feeRate = 0;
    if (mutation === 'route') config.policy.allowedDestinationChains = ['unsupported'];
    expect(() => createBitcoinCashBridgeActions(config)).toThrow();
    expect(config.calculateFee).not.toHaveBeenCalled();
    expect(config.reader.getSpendableUtxos).not.toHaveBeenCalled();
  });
  describe('generateSigningParameters', () => {
    /**
     * @target generateSigningParameters resolves trusted identifiers and builds an exact quoted deposit
     * @dependencies Real mixed-decimal TokenMap and authenticated parent fixture.
     * @scenario Prepare a 300000 satoshi deposit with one unit of each Rosen fee.
     * @expected Query configured NFT/Ergo asset and return valid builder parameters with fees unchanged.
     */
    it('resolves trusted identifiers and builds an exact quoted deposit', async () => {
      const { config, request } = await fixture();
      const result =
        await createBitcoinCashBridgeActions(config).generateSigningParameters(request);
      expect(config.calculateFee).toHaveBeenCalledWith('ergo', '11'.repeat(32), 1, '22'.repeat(32));
      expect(result.amount).toEqual(300000n);
      expect(result.bridgeFee).toEqual(1n);
      expect(result.networkFee).toEqual(1n);
      expect(generateBitcoinCashUnsignedLock(result).amount).toEqual(300000n);
    });
    /**
     * @target generateSigningParameters rejects wrapped equality before reading parents
     * @dependencies Real ceiling conversion with three-decimal wrapped asset.
     * @scenario Submit 100001 satoshis against total quoted fees of two wrapped units.
     * @expected Reject equality before authenticated UTXO reads.
     */
    it('rejects wrapped equality before reading parents', async () => {
      const { config, request } = await fixture();
      await expect(
        createBitcoinCashBridgeActions(config).generateSigningParameters({
          ...request,
          amount: 100001n,
        }),
      ).rejects.toThrow('trusted Rosen fees');
      expect(config.reader.getSpendableUtxos).not.toHaveBeenCalled();
    });
    /**
     * @target generateSigningParameters applies the shared proportional bridge fee formula
     * @dependencies Current fees with nonzero ratio and shared wrapped amount.
     * @scenario At wrapped amount ten, ratio 2500/10000 yields floor two, exceeding base one.
     * @expected Reject stale bridgeFee one and accept exactly two, without unwrapping fee fields.
     */
    it('applies the shared proportional bridge fee formula', async () => {
      const { config, request, fees } = await fixture();
      fees.feeRatio = 2500n;
      config.reader.getSpendableUtxos.mockResolvedValue([parentOutput(1, 2000000n)]);
      const actions = createBitcoinCashBridgeActions(config);
      await expect(
        actions.generateSigningParameters({ ...request, amount: 1000000n }),
      ).rejects.toThrow('quote changed');
      const result = await actions.generateSigningParameters({
        ...request,
        amount: 1000000n,
        bridgeFee: 2n,
      });
      expect(result.bridgeFee).toEqual(2n);
      expect(result.networkFee).toEqual(1n);
    });
    /**
     * @target generateSigningParameters rejects invalid quote %s
     * @dependencies Trusted fixture mutated at one independent boundary.
     * @scenario Remove mapping, remove allowed route or set ratio divisor to zero.
     * @expected Reject every malformed request before reading UTXOs.
     */
    it.each(['mapping', 'route', 'divisor'])('rejects invalid quote %s', async (mutation) => {
      const { config, request, fees } = await fixture();
      if (mutation === 'mapping') config.getTokenMap = async () => new TokenMap();
      if (mutation === 'route') request.toChain = 'bitcoin';
      if (mutation === 'divisor') fees.feeRatioDivisor = 0n;
      await expect(
        createBitcoinCashBridgeActions(config).generateSigningParameters(request),
      ).rejects.toThrow();
      expect(config.reader.getSpendableUtxos).not.toHaveBeenCalled();
    });
  });
  describe('submitTransaction', () => {
    /**
     * @target submitTransaction rejects absolute expiry after %s
     * @dependencies Actual signed intent, controlled clock and independently delayed map or fee query.
     * @scenario Cross deadline1100 during a mapping or quote callback at1200 with timers undispatched.
     * @expected Reject before the dedicated submitter can start its transport.
     */
    it.each(['mapping', 'fees'])('rejects absolute expiry after %s', async (phase) => {
      const { config, request, map, fees } = await fixture();
      const actions = createBitcoinCashBridgeActions(config);
      const intent = generateBitcoinCashUnsignedLock(
        await actions.generateSigningParameters(request),
      );
      let now = 1000;
      vi.spyOn(Date, 'now').mockImplementation(() => now);
      if (phase === 'mapping')
        config.getTokenMap = async () => {
          now = 1200;
          return map;
        };
      else
        config.calculateFee.mockImplementation(async () => {
          now = 1200;
          return { fees, nextFees: fees };
        });
      await expect(
        actions.submitTransaction(
          signIntent(intent),
          intent,
          request,
          new AbortController().signal,
          1100,
        ),
      ).rejects.toThrow(/^BCH submission deadline exceeded$/);
      expect(config.submitter.submit).not.toHaveBeenCalled();
      vi.restoreAllMocks();
    });
    /**
     * @target submitTransaction rejects invalid deadline %s
     * @dependencies Valid signed body and one independently malformed deadline.
     * @scenario Supply NaN, infinity, zero or a nonsafe integer through the internal typed port.
     * @expected Reject before any fee query or broadcast port call.
     */
    it.each([Number.NaN, Number.POSITIVE_INFINITY, 0, Number.MAX_SAFE_INTEGER + 1])(
      'rejects invalid deadline %s',
      async (deadline) => {
        const { config, request } = await fixture();
        const actions = createBitcoinCashBridgeActions(config);
        const intent = generateBitcoinCashUnsignedLock(
          await actions.generateSigningParameters(request),
        );
        config.calculateFee.mockClear();
        await expect(
          actions.submitTransaction(signIntent(intent), intent, request, undefined, deadline),
        ).rejects.toThrow(/^BCH submission deadline exceeded$/);
        expect(config.calculateFee).not.toHaveBeenCalled();
        expect(config.submitter.submit).not.toHaveBeenCalled();
      },
    );
    /**
     * @target submitTransaction forwards the trusted absolute deadline to the submitter
     * @dependencies Trusted deadline and actual signed lock.
     * @scenario Submit a valid quote with a future absolute deadline and no external signal.
     * @expected Preserve optional legacy arguments and forward the exact internal fifth deadline.
     */
    it('forwards the trusted absolute deadline to the submitter', async () => {
      const { config, request } = await fixture();
      const actions = createBitcoinCashBridgeActions(config);
      const intent = generateBitcoinCashUnsignedLock(
        await actions.generateSigningParameters(request),
      );
      const deadline = Date.now() + 10000;
      await actions.submitTransaction(signIntent(intent), intent, request, undefined, deadline);
      expect(config.submitter.submit).toHaveBeenCalledWith(
        signIntent(intent),
        intent,
        { toChain: 'ergo', toAddress: request.toAddress, bridgeFee: 1n, networkFee: 1n },
        undefined,
        deadline,
      );
    });
    /**
     * @target submitTransaction rejects cancellation at %s
     * @dependencies Real signed body and controlled mapping or fee await.
     * @scenario Abort before entry, during token mapping or during fee lookup.
     * @expected Reject promptly and never start submission, even if the pending read later resolves.
     */
    it.each(['entry', 'mapping', 'fees'])('rejects cancellation at %s', async (phase) => {
      const { config, request, map, fees } = await fixture();
      const actions = createBitcoinCashBridgeActions(config);
      const intent = generateBitcoinCashUnsignedLock(
        await actions.generateSigningParameters(request),
      );
      const controller = new AbortController();
      let release: (() => void) | undefined;
      let entered: (() => void) | undefined;
      const waiting = new Promise<void>((resolve) => {
        entered = resolve;
      });
      if (phase === 'mapping')
        config.getTokenMap = () =>
          new Promise((resolve) => {
            release = () => resolve(map);
            entered?.();
          });
      if (phase === 'fees')
        config.calculateFee.mockImplementation(
          () =>
            new Promise((resolve) => {
              release = () => resolve({ fees, nextFees: fees });
              entered?.();
            }),
        );
      if (phase === 'entry') controller.abort();
      const operation = actions.submitTransaction(
        signIntent(intent),
        intent,
        request,
        controller.signal,
      );
      if (phase !== 'entry') {
        await waiting;
        controller.abort();
      }
      await expect(operation).rejects.toThrow(/^BCH submission cancelled$/);
      release?.();
      await Promise.resolve();
      expect(config.submitter.submit).not.toHaveBeenCalled();
    });
    /**
     * @target submitTransaction forwards cancellation to the dedicated submitter
     * @dependencies Signed native body and exact server quote.
     * @scenario Submit with a non-aborted signal.
     * @expected Forward the original signal alongside authenticated intent and trusted metadata.
     */
    it('forwards cancellation to the dedicated submitter', async () => {
      const { config, request } = await fixture();
      const actions = createBitcoinCashBridgeActions(config);
      const intent = generateBitcoinCashUnsignedLock(
        await actions.generateSigningParameters(request),
      );
      const controller = new AbortController();
      await actions.submitTransaction(signIntent(intent), intent, request, controller.signal);
      expect(config.submitter.submit).toHaveBeenCalledWith(
        signIntent(intent),
        intent,
        { toChain: 'ergo', toAddress: request.toAddress, bridgeFee: 1n, networkFee: 1n },
        controller.signal,
      );
    });
    /**
     * @target submitTransaction submits only trusted quoted metadata
     * @dependencies Actual signed deposit, real TokenMap and submit port.
     * @scenario Prepare/sign valid bytes then submit route with arbitrary additional fee fields.
     * @expected Submit exactly current trusted wrapped fee metadata.
     */
    it('submits only trusted quoted metadata', async () => {
      const { config, request } = await fixture();
      const actions = createBitcoinCashBridgeActions(config);
      const intent = generateBitcoinCashUnsignedLock(
        await actions.generateSigningParameters(request),
      );
      const supplied = { ...request, bridgeFee: 999n };
      await actions.submitTransaction(signIntent(intent), intent, supplied);
      expect(config.submitter.submit).toHaveBeenCalledWith(signIntent(intent), intent, {
        toChain: 'ergo',
        toAddress: request.toAddress,
        bridgeFee: 1n,
        networkFee: 1n,
      });
    });
    /**
     * @target submitTransaction rejects a stale signed quote
     * @dependencies Valid signature over old fee metadata and updated trusted quote.
     * @scenario Increase current network fee after preparing and signing a funded deposit.
     * @expected Reject trusted body mismatch before calling the submitter.
     */
    it('rejects a stale signed quote', async () => {
      const { config, request, fees } = await fixture();
      const actions = createBitcoinCashBridgeActions(config);
      const intent = generateBitcoinCashUnsignedLock(
        await actions.generateSigningParameters({ ...request, amount: 400000n }),
      );
      fees.networkFee = 2n;
      await expect(actions.submitTransaction(signIntent(intent), intent, request)).rejects.toThrow(
        'trusted quote or policy',
      );
      expect(config.submitter.submit).not.toHaveBeenCalled();
    });
  });
});
