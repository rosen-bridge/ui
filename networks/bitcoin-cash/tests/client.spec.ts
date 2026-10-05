import { isValidElement } from 'react';

import { hashTransaction, hexToBin, lockingBytecodeToCashAddress } from '@bitauth/libauth';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TokenMap } from '@rosen-bridge/tokens';

import { BitcoinCashNetwork, type BitcoinCashNetworkConfig } from '../src/client';
import { parentOutput, signIntent, signingIntent } from './testUtils';

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

/** Actual builder parameters and native token fixture; candidate index is isolated to this spec. */
const parameters = () => {
  const intent = signingIntent();
  return {
    fromAddress: intent.fromAddress,
    lockAddress: intent.lockAddress,
    amount: intent.amount,
    feeRate: 2,
    maxFee: 10000n,
    toChain: 'ethereum',
    toAddress: `0x${'12'.repeat(20)}`,
    bridgeFee: 100n,
    networkFee: 100n,
    utxos: [parentOutput(1)],
  };
};
/** Complete typed real-action shape with bounded native test results. */
const configuration = () => {
  const fees = {
    bridgeFee: 100n,
    networkFee: 100n,
    feeRatio: 0n,
    feeRatioDivisor: 10000n,
    rsnRatio: 0n,
    rsnRatioDivisor: 1n,
  };
  const config = {
    getTokenMap: async () => {
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson([
        {
          'bitcoin-cash': {
            tokenId: 'bch',
            name: 'BCH',
            decimals: 8,
            type: 'native',
            residency: 'native',
            extra: {},
          },
          ethereum: {
            tokenId: 'wrapped-bch',
            name: 'Wrapped BCH',
            decimals: 8,
            type: 'token',
            residency: 'wrapped',
            extra: {},
          },
          ergo: {
            tokenId: '11'.repeat(32),
            name: 'Wrapped BCH',
            decimals: 8,
            type: 'token',
            residency: 'wrapped',
            extra: {},
          },
        },
      ]);
      return tokenMap;
    },
    lockAddress: signingIntent().lockAddress,
    nextHeightInterval: 1,
    calculateFee: vi.fn(async () => ({ fees, nextFees: fees })),
    getMaxTransfer: vi.fn(async () => 900n),
    getMinTransfer: vi.fn(async () => 546n),
    validateAddress: vi.fn(async () => true),
    getAddressBalance: vi.fn(async () => 100000n),
    generateSigningParameters: vi.fn<BitcoinCashNetworkConfig['generateSigningParameters']>(
      async () => parameters(),
    ),
    submitTransaction: vi.fn<BitcoinCashNetworkConfig['submitTransaction']>(async (signed) =>
      hashTransaction(hexToBin(signed)),
    ),
  } satisfies BitcoinCashNetworkConfig;
  return config;
};
afterEach(() => {
  candidate.index = 10;
});

describe('BitcoinCashNetwork', () => {
  describe('constructor', () => {
    /**
     * @target BitcoinCashNetwork.constructor rejects an unassigned chain
     * @dependencies Isolated candidate index fixture and complete action configuration.
     * @scenario Restore the unassigned -1 index before construction.
     * @expected Reject construction without invoking a server action.
     */
    it('rejects an unassigned chain', () => {
      candidate.index = -1;
      const config = configuration();
      expect(() => new BitcoinCashNetwork(config)).toThrow('unassigned');
      expect(config.getAddressBalance).not.toHaveBeenCalled();
    });
    /**
     * @target BitcoinCashNetwork.constructor rejects invalid %s
     * @dependencies Complete config with isolated malformed port/address/interval.
     * @scenario Remove balance action or supply invalid treasury/height interval.
     * @expected Reject instead of registering an incomplete Network.
     */
    it.each(['port', 'treasury', 'interval'])('rejects invalid %s', (mutation) => {
      const config = configuration();
      if (mutation === 'port')
        Object.defineProperty(config, 'getAddressBalance', { value: undefined });
      if (mutation === 'treasury') config.lockAddress = 'bitcoincash:invalid';
      if (mutation === 'interval') config.nextHeightInterval = 0;
      expect(() => new BitcoinCashNetwork(config)).toThrow();
    });
    /**
     * @target BitcoinCashNetwork.constructor uses the real typed SVG icon export
     * @dependencies Real icons artifact and typed Network consumer.
     * @scenario Invoke the BCH logo export using valid SVG props.
     * @expected Produce an SVG element rather than an implicit-any string declaration.
     */
    it('uses the real typed SVG icon export', () => {
      const network = new BitcoinCashNetwork(configuration());
      const element = network.logo({ width: 24, height: 24 });
      expect(isValidElement(element)).toEqual(true);
      if (isValidElement(element)) expect(element.type).toEqual('svg');
    });
  });
  describe('getAddressBalance', () => {
    /**
     * @target BitcoinCashNetwork.getAddressBalance checks balance %s
     * @dependencies Typed callback and canonical mainnet source address.
     * @scenario Return valid, negative or above-supply balances.
     * @expected Preserve the valid bigint and reject out-of-range results.
     */
    it.each([100000n, -1n, 2100000000000001n])('checks balance %s', async (value) => {
      const config = configuration();
      config.getAddressBalance.mockResolvedValue(value);
      const network = new BitcoinCashNetwork(config);
      if (value === 100000n)
        expect(await network.getAddressBalance(parameters().fromAddress)).toEqual(value);
      else
        await expect(network.getAddressBalance(parameters().fromAddress)).rejects.toThrow(
          'balance',
        );
    });
    /**
     * @target BitcoinCashNetwork.getAddressBalance rejects token-aware source addresses before reading
     * @dependencies Real libauth tokenSupport address variant.
     * @scenario Encode the ordinary source script with tokenSupport true.
     * @expected Reject before requesting a balance.
     */
    it('rejects token-aware source addresses before reading', async () => {
      const token = lockingBytecodeToCashAddress({
        bytecode: hexToBin(parentOutput(1).scriptPubKey),
        prefix: 'bitcoincash',
        tokenSupport: true,
      });
      if (typeof token === 'string') throw new Error(token);
      const config = configuration();
      await expect(new BitcoinCashNetwork(config).getAddressBalance(token.address)).rejects.toThrow(
        'native P2PKH',
      );
      expect(config.getAddressBalance).not.toHaveBeenCalled();
    });
  });
  describe('generateSigningParameters', () => {
    /**
     * @target BitcoinCashNetwork.generateSigningParameters snapshots a caller request before awaiting TokenMap
     * @dependencies Controlled map lookup and action returning the original parameters.
     * @scenario Mutate source address and amount after starting the operation but before releasing the map.
     * @expected Preserve the original validated address and amount in the action request and result.
     */
    it('snapshots a caller request before awaiting TokenMap', async () => {
      const config = configuration();
      const map = await config.getTokenMap();
      let release!: (map: TokenMap) => void;
      config.getTokenMap = () =>
        new Promise((resolve) => {
          release = resolve;
        });
      const request = parameters();
      const original = { ...request };
      const result = new BitcoinCashNetwork(config).generateSigningParameters(request);
      request.fromAddress = 'invalid';
      request.amount += 1n;
      release(map);
      expect(await result).toEqual(original);
      expect(config.generateSigningParameters).toHaveBeenCalledWith({
        fromAddress: original.fromAddress,
        amount: original.amount,
        toChain: original.toChain,
        toAddress: original.toAddress,
        bridgeFee: original.bridgeFee,
        networkFee: original.networkFee,
      });
    });
    /**
     * @target BitcoinCashNetwork.generateSigningParameters rejects action mutation of request authority
     * @dependencies Action callback attempting to replace the original amount.
     * @scenario Increment the action argument and return corresponding signing parameters.
     * @expected Reject mutation and preserve the caller's original amount.
     */
    it('rejects action mutation of request authority', async () => {
      const config = configuration();
      config.generateSigningParameters.mockImplementation(async (request) => {
        request.amount += 1n;
        return { ...parameters(), ...request };
      });
      const request = parameters();
      await expect(
        new BitcoinCashNetwork(config).generateSigningParameters(request),
      ).rejects.toThrow();
      expect(request.amount).toEqual(parameters().amount);
    });
    /**
     * @target BitcoinCashNetwork.generateSigningParameters checks mixed-decimal fee coverage %s
     * @dependencies Real TokenMap with an eight-to-three-decimal mapping and server-action spy.
     * @scenario Raw amount exceeds fee sum but its wrapped value is equal to or below fees.
     * @expected Reject both underfunded cases before requesting UTXOs; preserve quoted fees when funded.
     */
    it.each([100000n, 100001n, 200001n])('checks mixed-decimal fee coverage %s', async (amount) => {
      const config = configuration();
      const map = await config.getTokenMap();
      const mapping = map.getConfig()[0];
      mapping.ethereum.decimals = 3;
      mapping.ergo.decimals = 3;
      await map.updateConfigByJson([mapping]);
      config.getTokenMap = async () => map;
      const request = { ...parameters(), amount, bridgeFee: 1n, networkFee: 1n };
      config.generateSigningParameters.mockResolvedValue(request);
      const result = new BitcoinCashNetwork(config).generateSigningParameters(request);
      if (amount === 200001n) {
        expect(await result).toEqual(request);
        expect(config.generateSigningParameters).toHaveBeenCalledWith({
          fromAddress: request.fromAddress,
          amount: request.amount,
          toChain: request.toChain,
          toAddress: request.toAddress,
          bridgeFee: request.bridgeFee,
          networkFee: request.networkFee,
        });
      } else {
        await expect(result).rejects.toThrow('wrapped deposit does not cover');
        expect(config.generateSigningParameters).not.toHaveBeenCalled();
      }
    });
    /**
     * @target BitcoinCashNetwork.generateSigningParameters rejects an absent asset mapping
     * @dependencies Empty real TokenMap and signing action spy.
     * @scenario Request an otherwise valid native deposit with no configured bridge mapping.
     * @expected Reject before the signing action.
     */
    it('rejects an absent asset mapping', async () => {
      const config = configuration();
      config.getTokenMap = async () => new TokenMap();
      await expect(
        new BitcoinCashNetwork(config).generateSigningParameters(parameters()),
      ).rejects.toThrow('asset mapping');
      expect(config.generateSigningParameters).not.toHaveBeenCalled();
    });
    /**
     * @target BitcoinCashNetwork.generateSigningParameters checks signing parameters %s
     * @dependencies Typed action returning real builder parameters.
     * @scenario Return valid parameters or independently change treasury, amount or destination.
     * @expected Accept exact parameters and reject each mismatch.
     */
    it.each([
      'valid',
      'treasury',
      'amount',
      'destination',
      'source',
      'chain',
      'bridgeFee',
      'networkFee',
    ])('checks signing parameters %s', async (mutation) => {
      const request = parameters();
      const config = configuration();
      const response = parameters();
      if (mutation === 'treasury') response.lockAddress = response.fromAddress;
      if (mutation === 'amount') response.amount += 1n;
      if (mutation === 'destination') response.toAddress = `0x${'13'.repeat(20)}`;
      if (mutation === 'source') response.fromAddress = response.lockAddress;
      if (mutation === 'chain') response.toChain = 'binance';
      if (mutation === 'bridgeFee') response.bridgeFee += 1n;
      if (mutation === 'networkFee') response.networkFee += 1n;
      config.generateSigningParameters.mockResolvedValue(response);
      const result = new BitcoinCashNetwork(config).generateSigningParameters(request);
      if (mutation === 'valid') expect(await result).toEqual(response);
      else await expect(result).rejects.toThrow('changed request');
    });
  });
  describe('submitTransaction', () => {
    /**
     * @target BitcoinCashNetwork.submitTransaction rejects cancelled submission %s
     * @dependencies Valid signed native intent and a controlled TokenMap wait.
     * @scenario Abort before validation or while mapping is pending.
     * @expected Reject with fixed cancellation text and never invoke the submit port.
     */
    it.each(['entry', 'mapping'])('rejects cancelled submission %s', async (phase) => {
      const config = configuration();
      const map = await config.getTokenMap();
      let release: ((value: TokenMap) => void) | undefined;
      if (phase === 'mapping')
        config.getTokenMap = () =>
          new Promise((resolve) => {
            release = resolve;
          });
      const controller = new AbortController();
      if (phase === 'entry') controller.abort();
      const intent = signingIntent();
      const pending = new BitcoinCashNetwork(config).submitTransaction(
        signIntent(intent),
        intent,
        parameters(),
        controller.signal,
      );
      if (phase === 'mapping') {
        controller.abort();
        release?.(map);
      }
      await expect(pending).rejects.toThrow(/^BCH submission cancelled$/);
      expect(config.submitTransaction).not.toHaveBeenCalled();
    });
    /**
     * @target BitcoinCashNetwork.submitTransaction forwards the active signal without altering intent
     * @dependencies Valid signed intent and typed optional-signal port.
     * @scenario Submit with an active signal.
     * @expected Pass exactly that signal with the immutable validated intent and fee metadata.
     */
    it('forwards the active signal without altering intent', async () => {
      const config = configuration();
      const intent = signingIntent();
      const controller = new AbortController();
      const metadata = {
        toChain: 'ethereum',
        toAddress: parameters().toAddress,
        bridgeFee: 100n,
        networkFee: 100n,
      };
      await new BitcoinCashNetwork(config).submitTransaction(
        signIntent(intent),
        intent,
        metadata,
        controller.signal,
      );
      expect(config.submitTransaction).toHaveBeenCalledWith(
        signIntent(intent),
        intent,
        metadata,
        controller.signal,
      );
    });
    /**
     * @target BitcoinCashNetwork.submitTransaction snapshots submission %s before awaiting
     * @dependencies Mutable copies of a valid signed intent and controlled mapping lookup.
     * @scenario Change caller amount, parent value and fee metadata after starting submission.
     * @expected Pass the original signed intent and metadata to the action, never mutated authority.
     */
    it.each(['amount', 'parent', 'metadata'])(
      'snapshots submission %s before awaiting',
      async (mutation) => {
        const config = configuration();
        const map = await config.getTokenMap();
        let release!: (map: TokenMap) => void;
        config.getTokenMap = () =>
          new Promise((resolve) => {
            release = resolve;
          });
        const intent = signingIntent();
        const mutable = {
          ...intent,
          selectedUtxos: intent.selectedUtxos.map((utxo) => ({ ...utxo })),
        };
        const metadata = parameters();
        const signed = signIntent(intent);
        const result = new BitcoinCashNetwork(config).submitTransaction(signed, mutable, metadata);
        if (mutation === 'amount') mutable.amount += 1n;
        if (mutation === 'parent') mutable.selectedUtxos[0].value += 1n;
        if (mutation === 'metadata') metadata.bridgeFee += 1n;
        release(map);
        expect(await result).toEqual(hashTransaction(hexToBin(signed)));
        expect(config.submitTransaction).toHaveBeenCalledWith(signed, intent, {
          toChain: 'ethereum',
          toAddress: parameters().toAddress,
          bridgeFee: 100n,
          networkFee: 100n,
        });
      },
    );
    /**
     * @target BitcoinCashNetwork.submitTransaction rejects oversized signing context %s
     * @dependencies Valid intent with independently oversized input count or copied parent budget.
     * @scenario Supply 101 selected inputs or more than 4000000 copied parent characters.
     * @expected Reject without querying TokenMap or invoking submission.
     */
    it.each(['count', 'parents'])('rejects oversized signing context %s', async (mutation) => {
      const config = configuration();
      const getTokenMap = vi.fn(config.getTokenMap);
      config.getTokenMap = getTokenMap;
      const intent = signingIntent();
      const oversized = {
        ...intent,
        selectedUtxos:
          mutation === 'count'
            ? Array.from({ length: 101 }, () => intent.selectedUtxos[0])
            : [{ ...intent.selectedUtxos[0], parentTransactionHex: '0'.repeat(4_000_001) }],
      };
      await expect(
        new BitcoinCashNetwork(config).submitTransaction(
          signIntent(intent),
          oversized,
          parameters(),
        ),
      ).rejects.toThrow('signing context');
      expect(getTokenMap).not.toHaveBeenCalled();
      expect(config.submitTransaction).not.toHaveBeenCalled();
    });
    /**
     * @target BitcoinCashNetwork.submitTransaction rejects wrapped fee underfunding before submission
     * @dependencies Actual signed bytes and real eight-to-three-decimal TokenMap.
     * @scenario Change the mapping after construction so raw amount is greater than fees but wrapped amount is not.
     * @expected Reject before the submission callback even though all signatures are valid.
     */
    it('rejects wrapped fee underfunding before submission', async () => {
      const config = configuration();
      const map = await config.getTokenMap();
      const mapping = map.getConfig()[0];
      mapping.ergo.decimals = 3;
      await map.updateConfigByJson([mapping]);
      config.getTokenMap = async () => map;
      const intent = signingIntent();
      await expect(
        new BitcoinCashNetwork(config).submitTransaction(signIntent(intent), intent, parameters()),
      ).rejects.toThrow('wrapped deposit does not cover');
      expect(config.submitTransaction).not.toHaveBeenCalled();
    });
    /**
     * @target BitcoinCashNetwork.submitTransaction checks submit boundary %s
     * @dependencies Actual Schnorr signature, shared validator and typed submission callback.
     * @scenario Submit valid bytes, invalid bytes or receive a wrong server ID.
     * @expected Accept exact ID only; reject malformed bytes locally or mismatched server response.
     */
    it.each(['valid', 'bytes', 'id'])('checks submit boundary %s', async (mutation) => {
      const intent = signingIntent();
      const signed = signIntent(intent);
      const config = configuration();
      if (mutation === 'id') config.submitTransaction.mockResolvedValue('00'.repeat(32));
      const result = new BitcoinCashNetwork(config).submitTransaction(
        mutation === 'bytes' ? '00' : signed,
        intent,
        parameters(),
      );
      if (mutation === 'valid') expect(await result).toEqual(hashTransaction(hexToBin(signed)));
      else await expect(result).rejects.toThrow();
      if (mutation === 'bytes') expect(config.submitTransaction).not.toHaveBeenCalled();
    });
  });
  describe('getMaxTransfer', () => {
    /**
     * @target BitcoinCashNetwork.getMaxTransfer excludes non-native assets
     * @dependencies Typed maximum-transfer port and explicit token type.
     * @scenario Request a maximum for a non-native asset.
     * @expected Return zero without invoking native UTXO actions.
     */
    it('excludes non-native assets', async () => {
      const config = configuration();
      const network = new BitcoinCashNetwork(config);
      expect(
        await network.getMaxTransfer({
          balance: 1000n,
          isNative: false,
          eventData: {
            toChain: 'ethereum',
            fromAddress: parameters().fromAddress,
            toAddress: parameters().toAddress,
          },
        }),
      ).toEqual(0n);
      expect(config.getMaxTransfer).not.toHaveBeenCalled();
    });
  });
  describe('getMinTransfer', () => {
    /**
     * @target BitcoinCashNetwork.getMinTransfer checks asset %s
     * @dependencies Typed minimum-transfer port and eight-decimal native BCH asset.
     * @scenario Use valid BCH or independently change token type, identifier or decimals.
     * @expected Delegate valid native BCH and reject every unsupported asset first.
     */
    it.each(['valid', 'type', 'id', 'decimals'])('checks asset %s', async (mutation) => {
      const config = configuration();
      const token = {
        name: 'BCH',
        tokenId: 'bch',
        type: 'native',
        decimals: 8,
        residency: 'bitcoin-cash',
        extra: {},
      };
      if (mutation === 'type') token.type = 'token';
      if (mutation === 'id') token.tokenId = 'foreign';
      if (mutation === 'decimals') token.decimals = 18;
      const result = new BitcoinCashNetwork(config).getMinTransfer(
        token,
        'ethereum',
        '11'.repeat(32),
      );
      if (mutation === 'valid') expect(await result).toEqual(546n);
      else {
        await expect(result).rejects.toThrow('native eight-decimal');
        expect(config.getMinTransfer).not.toHaveBeenCalled();
      }
    });
  });
});
