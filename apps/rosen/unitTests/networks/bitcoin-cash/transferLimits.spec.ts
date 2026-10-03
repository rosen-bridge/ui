import { afterEach, describe, expect, it, vi } from 'vitest';

import { TokenMap } from '@rosen-bridge/tokens';
import { generateBitcoinCashLockFee } from '@rosen-network/bitcoin-cash';

import {
  parentOutput,
  signingIntent,
} from '../../../../../networks/bitcoin-cash/tests/mocked/signing.mock';
import {
  type BitcoinCashTransferLimitConfig,
  createBitcoinCashTransferLimits,
} from '../../../src/networks/bitcoin-cash/transferLimits';

const { candidate } = vi.hoisted(() => ({ candidate: { index: 10 } }));
vi.mock('@rosen-ui/constants', async () => {
  const actual = await vi.importActual<typeof import('@rosen-ui/constants')>('@rosen-ui/constants');
  return {
    ...actual,
    isNetworkAvailable: (key: string) =>
      key === 'bitcoin-cash' ? candidate.index >= 0 : actual.isNetworkAvailable(key),
  };
});

/** Actual native mapping, current quote and authenticated canonical parent fixtures. */
const fixture = async (decimals = 3) => {
  const map = new TokenMap();
  const token = {
    tokenId: 'bch',
    name: 'BCH',
    decimals: 8,
    type: 'native',
    residency: 'native',
    extra: {},
  };
  await map.updateConfigByJson([
    {
      'bitcoin-cash': token,
      ergo: { ...token, tokenId: '11'.repeat(32), type: 'token', residency: 'wrapped', decimals },
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
    getTokenMap: async () => map,
    calculateFee: vi.fn(async () => ({ fees, nextFees: fees })),
    reader: {
      getSpendableUtxos: vi.fn(async () => [parentOutput(1, 500000n)]),
      getAddressAssets: async () => ({ nativeToken: 500000n, tokens: [] }),
    },
  } satisfies BitcoinCashTransferLimitConfig;
  const eventData = {
    fromAddress: signingIntent().fromAddress,
    toChain: 'ergo' as const,
    toAddress: '9iMjQx8PzwBKXRvsFUJFJAPoy31znfEeBUGz8DRkcnJX4rJYjVd',
  };
  return { config, fees, map, token, eventData };
};
afterEach(() => {
  candidate.index = 10;
});

describe('createBitcoinCashTransferLimits', () => {
  /**
   * @target Native limit factories retain disabled defaults and explicit operator policy.
   * @dependencies Candidate-only assignment and complete policy fixture.
   * @scenario Independently unset index, replace NFT, zero fee rate or max fee.
   * @expected Reject construction before reading a quote or UTXO snapshot.
   */
  it.each(['index', 'nft', 'rate', 'fee'])('rejects invalid policy %s', async (mutation) => {
    const { config } = await fixture();
    if (mutation === 'index') candidate.index = -1;
    if (mutation === 'nft') config.minimumFeeNFT = 'not-configured';
    if (mutation === 'rate') config.policy.feeRate = 0;
    if (mutation === 'fee') config.policy.maxFee = 0n;
    expect(() => createBitcoinCashTransferLimits(config)).toThrow();
    expect(config.calculateFee).not.toHaveBeenCalled();
  });
  describe('getMinTransfer', () => {
    /**
     * @target Conversion snapshots reject independently oversized or malformed mapping primitives.
     * @dependencies Real TokenMap with one corrupted conversion-set bound.
     * @scenario Exceed chain count, use negative/fractional decimals or an overlong name.
     * @expected Reject before querying fees or reading native inputs.
     */
    it.each(['count', 'negative', 'fraction', 'name'])(
      'rejects mapping bound %s',
      async (mutation) => {
        const { config, map, token } = await fixture();
        const mapping = map.getTokenSet('bch');
        if (!mapping) throw new Error('Missing mapping fixture');
        if (mutation === 'count')
          for (let index = 0; index < 63; index++) mapping[`chain-${index}`] = { ...token };
        if (mutation === 'negative') mapping.ergo.decimals = -1;
        if (mutation === 'fraction') mapping.ergo.decimals = 1.5;
        if (mutation === 'name') mapping.ergo.name = 'x'.repeat(1025);
        await expect(
          createBitcoinCashTransferLimits(config).getMinTransfer(
            token,
            'ergo',
            config.minimumFeeNFT,
          ),
        ).rejects.toThrow('Invalid BCH transfer limit mapping');
        expect(config.calculateFee).not.toHaveBeenCalled();
      },
    );
    /**
     * @target Conversion snapshots preserve decimals from every chain in the set.
     * @dependencies Native-eight/Ergo-eight mapping with a zero-decimal third chain.
     * @scenario Calculate the minimum for Ergo while a different wrapped chain controls normalization.
     * @expected Use three wrapped units through the real TokenMap minimum-decimal rule.
     */
    it('retains a third chain controlling normalized decimals', async () => {
      const { config, map, token } = await fixture(8);
      const mapping = map.getTokenSet('bch');
      if (!mapping) throw new Error('Missing mapping fixture');
      mapping.ethereum = { ...token, tokenId: 'other', type: 'token', decimals: 0 };
      expect(
        await createBitcoinCashTransferLimits(config).getMinTransfer(
          token,
          'ergo',
          config.minimumFeeNFT,
        ),
      ).toEqual(3n);
    });
    /**
     * @target Fee lookup and amount conversion share one immutable token mapping.
     * @dependencies Real TokenMap updated in place during the fee query.
     * @scenario Replace only the shared Ergo token and decimals while the quote awaits.
     * @expected Preserve the original three-unit minimum and original fee token identifier.
     */
    it('preserves mapping across the fee await', async () => {
      const { config, fees, map, token } = await fixture();
      config.calculateFee.mockImplementation(async () => {
        await map.updateConfigByJson([
          {
            'bitcoin-cash': token,
            ergo: { ...token, tokenId: '33'.repeat(32), type: 'token', residency: 'wrapped' },
          },
        ]);
        return { fees, nextFees: fees };
      });
      expect(
        await createBitcoinCashTransferLimits(config).getMinTransfer(
          token,
          'ergo',
          config.minimumFeeNFT,
        ),
      ).toEqual(3n);
      expect(config.calculateFee).toHaveBeenCalledWith('ergo', '11'.repeat(32), 0, '22'.repeat(32));
    });
    /**
     * @target The minimum covers fixed fees, proportional fees and raw native dust in wrapped units.
     * @dependencies Real mixed/equal decimal mappings and current fee quote.
     * @scenario Check fixed fee minimum, 90 percent ratio minimum and zero-fee raw dust minimum.
     * @expected Return three, eleven and 546 units respectively using the configured NFT/Ergo ID.
     */
    it.each(['fixed', 'ratio', 'dust'])('calculates exact minimum %s', async (scenario) => {
      const { config, fees, token } = await fixture(scenario === 'dust' ? 8 : 3);
      if (scenario === 'ratio') fees.feeRatio = 9000n;
      if (scenario === 'dust') {
        fees.bridgeFee = 0n;
        fees.networkFee = 0n;
      }
      const minimum = await createBitcoinCashTransferLimits(config).getMinTransfer(
        token,
        'ergo',
        config.minimumFeeNFT,
      );
      expect(minimum).toEqual(scenario === 'fixed' ? 3n : scenario === 'ratio' ? 11n : 546n);
      expect(config.calculateFee).toHaveBeenCalledWith('ergo', '11'.repeat(32), 0, '22'.repeat(32));
    });
    /**
     * @target Unsupported assets, caller-selected NFTs and nonviable fee ratios fail closed.
     * @dependencies One independently corrupted field in an otherwise valid native request.
     * @scenario Change token identifier/type/decimals, NFT, ratio or divisor.
     * @expected Reject without returning a misleading zero minimum.
     */
    it.each(['id', 'type', 'decimals', 'nft', 'ratio', 'divisor'])(
      'rejects invalid minimum %s',
      async (mutation) => {
        const { config, fees, token } = await fixture();
        if (mutation === 'id') token.tokenId = 'other';
        if (mutation === 'type') token.type = 'token';
        if (mutation === 'decimals') token.decimals = 3;
        if (mutation === 'ratio') fees.feeRatio = fees.feeRatioDivisor;
        if (mutation === 'divisor') fees.feeRatioDivisor = 0n;
        await expect(
          createBitcoinCashTransferLimits(config).getMinTransfer(
            token,
            'ergo',
            mutation === 'nft' ? '99'.repeat(32) : config.minimumFeeNFT,
          ),
        ).rejects.toThrow();
      },
    );
  });
  describe('getMaxTransfer', () => {
    /**
     * @target The maximum retains the conversion used to authorize its fee query.
     * @dependencies Real TokenMap updated in place during the authenticated UTXO read.
     * @scenario Replace only the shared Ergo token and decimals after the fee query.
     * @expected Return the original four wrapped units rather than new raw-scale units.
     */
    it('preserves mapping across the reader await', async () => {
      const { config, map, token, eventData } = await fixture();
      config.reader.getSpendableUtxos.mockImplementation(async () => {
        await map.updateConfigByJson([
          {
            'bitcoin-cash': token,
            ergo: { ...token, tokenId: '33'.repeat(32), type: 'token', residency: 'wrapped' },
          },
        ]);
        return [parentOutput(1, 500000n)];
      });
      expect(
        await createBitcoinCashTransferLimits(config).getMaxTransfer({
          balance: 999n,
          isNative: true,
          eventData,
        }),
      ).toEqual(4n);
      expect(config.calculateFee).toHaveBeenCalledWith('ergo', '11'.repeat(32), 0, '22'.repeat(32));
    });
    /**
     * @target Maximum transfer rounds down after reserving BCH miner fee and required change.
     * @dependencies Real shared BCH estimator, native builder and mixed-decimal TokenMap.
     * @scenario Read 500000 raw satoshis even if caller claims an inflated wrapped balance.
     * @expected Offer four wrapped units, bounded by authenticated balance rather than caller authority.
     */
    it('rounds maximum down and ignores inflated caller balance authority', async () => {
      const { config, eventData } = await fixture();
      expect(
        await createBitcoinCashTransferLimits(config).getMaxTransfer({
          balance: 999n,
          isNative: true,
          eventData,
        }),
      ).toEqual(4n);
    });
    /**
     * @target Uneconomic extra inputs cannot reduce a larger valid maximum.
     * @dependencies Equal-decimal map, one funded parent and a one-satoshi parent.
     * @scenario Add an input worth less than its incremental signed byte fee.
     * @expected Keep the single-input maximum from the shared BCH estimator and change floor.
     */
    it('chooses the best economically useful input prefix', async () => {
      const { config, eventData } = await fixture(8);
      config.reader.getSpendableUtxos.mockResolvedValue([
        parentOutput(2, 1n),
        parentOutput(1, 500000n),
      ]);
      const fee = generateBitcoinCashLockFee({
        ...eventData,
        bridgeFee: 0n,
        networkFee: 0n,
        inputCount: 1,
        feeRate: 2,
      });
      expect(
        await createBitcoinCashTransferLimits(config).getMaxTransfer({
          balance: 500001n,
          isNative: true,
          eventData,
        }),
      ).toEqual(500000n - fee - 546n);
    });
    /**
     * @target Unsupported assets and unavailable balances do not start remote reads.
     * @dependencies Reader and quote spies.
     * @scenario Request nonnative, zero balance or missing destination.
     * @expected Return zero without network access.
     */
    it.each(['token', 'balance', 'address'])(
      'excludes unavailable maximum %s',
      async (mutation) => {
        const { config, eventData } = await fixture();
        if (mutation === 'address') eventData.toAddress = '';
        expect(
          await createBitcoinCashTransferLimits(config).getMaxTransfer({
            balance: mutation === 'balance' ? 0n : 5n,
            isNative: mutation !== 'token',
            eventData,
          }),
        ).toEqual(0n);
        expect(config.reader.getSpendableUtxos).not.toHaveBeenCalled();
        expect(config.calculateFee).not.toHaveBeenCalled();
      },
    );
    /**
     * @target Empty, dust-only and fee-cap-ineligible snapshots cannot offer a spendable deposit.
     * @dependencies Authenticated parent fixtures and explicit miner fee cap.
     * @scenario Independently empty UTXOs, use a dust-only balance or lower max fee below one input cost.
     * @expected Return zero and retain the change reserve.
     */
    it.each(['empty', 'dust', 'fee'])(
      'returns zero for unavailable capacity %s',
      async (mutation) => {
        const { config, eventData } = await fixture();
        if (mutation === 'empty') config.reader.getSpendableUtxos.mockResolvedValue([]);
        if (mutation === 'dust')
          config.reader.getSpendableUtxos.mockResolvedValue([parentOutput(1, 546n)]);
        if (mutation === 'fee') config.policy.maxFee = 1n;
        expect(
          await createBitcoinCashTransferLimits(config).getMaxTransfer({
            balance: 5n,
            isNative: true,
            eventData,
          }),
        ).toEqual(0n);
      },
    );
    /**
     * @target An inflated UTXO assertion never establishes a native maximum without authenticating its raw parent.
     * @dependencies Actual parent containing 500000 satoshis and inconsistent advertised value.
     * @scenario Raise only the asserted UTXO amount.
     * @expected Shared native builder rejects the inconsistent parent.
     */
    it('rejects a forged parent balance', async () => {
      const { config, eventData } = await fixture();
      config.reader.getSpendableUtxos.mockResolvedValue([
        { ...parentOutput(1, 500000n), value: 600000n },
      ]);
      await expect(
        createBitcoinCashTransferLimits(config).getMaxTransfer({
          balance: 999n,
          isNative: true,
          eventData,
        }),
      ).rejects.toThrow();
    });
  });
});
