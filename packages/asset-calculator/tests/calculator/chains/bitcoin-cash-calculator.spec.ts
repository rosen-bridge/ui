import { describe, expect, it, vi } from 'vitest';

import { TokenMap } from '@rosen-bridge/tokens';

import { BitcoinCashCalculator } from '../../../lib/calculator/chains/bitcoin-cash-calculator';
import type { BitcoinCashBalanceProvider } from '../../../lib/interfaces';
import { addresses, nativeToken, wrappedToken } from './bitcoinCashTestData';

/** Maximum native BCH issuance in exact satoshis, used at the accounting cap. */
const maxSatoshis = 2_100_000_000_000_000n;

describe('BitcoinCashCalculator', () => {
  describe('constructor', () => {
    /**
     * @target BitcoinCashCalculator.constructor rejects invalid treasury
     * address configuration %#
     * @dependencies Shared address codec.
     * @scenario Supply empty, excessive, duplicate, nonmainnet, or malformed configuration.
     * @expected Reject before querying the provider.
     */
    it.each([
      [],
      Array(101).fill(addresses[0]),
      [addresses[0], addresses[0].toUpperCase()],
      ['bchtest:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a'],
      ['invalid'],
    ])('rejects invalid treasury address configuration %#', (configuredAddresses) => {
      const provider = { getAddressAssets: vi.fn() };
      expect(
        () => new BitcoinCashCalculator(new TokenMap(), configuredAddresses, provider),
      ).toThrow();
      expect(provider.getAddressAssets).not.toHaveBeenCalled();
    });

    /**
     * @target BitcoinCashCalculator.constructor rejects an absent provider
     * @dependencies None.
     * @scenario Omit the provider at the runtime boundary.
     * @expected Reject without creating an endpoint default.
     */
    it('rejects an absent provider', () => {
      expect(
        () =>
          new BitcoinCashCalculator(
            new TokenMap(),
            addresses,
            undefined as unknown as BitcoinCashBalanceProvider,
          ),
      ).toThrow('read-only asset provider');
    });
  });

  describe('getRawLockedAmountsPerAddress', () => {
    /**
     * @target BitcoinCashCalculator.getRawLockedAmountsPerAddress preserves
     * exact native amounts and omits zero balances
     * @dependencies Mock read-only provider.
     * @scenario Return the maximum native balance and a zero balance to two addresses.
     * @expected Preserve exact satoshis, omit zero, and keep native wrapped accounting zero.
     */
    it('preserves exact native amounts and omits zero balances', async () => {
      const getAddressAssets = vi.fn(async (address: string) => ({
        nativeToken: address === addresses[0] ? maxSatoshis : 0n,
        tokens: [],
      }));
      const calculator = new BitcoinCashCalculator(
        new TokenMap(),
        [addresses[0].toUpperCase(), addresses[1]],
        { getAddressAssets },
      );
      expect(getAddressAssets).not.toHaveBeenCalled();
      expect(await calculator.getRawLockedAmountsPerAddress(nativeToken)).toEqual([
        { address: addresses[0], amount: maxSatoshis },
      ]);
      expect(getAddressAssets.mock.calls.map(([address]) => address)).toEqual(addresses);
    });

    /**
     * @target BitcoinCashCalculator.getRawLockedAmountsPerAddress rejects
     * malformed provider assets %#
     * @dependencies Mock read-only provider.
     * @scenario Independently inject a nonbigint, negative, excessive balance, tokens, or missing token list.
     * @expected Fixed sanitized error and no partial result.
     */
    it.each([
      { nativeToken: 1, tokens: [] },
      { nativeToken: -1n, tokens: [] },
      { nativeToken: maxSatoshis + 1n, tokens: [] },
      { nativeToken: 1n, tokens: ['token'] },
      { nativeToken: 1n },
      null,
    ])('rejects malformed provider assets %#', async (assets) => {
      const provider = {
        getAddressAssets: async () => assets,
      } as unknown as BitcoinCashBalanceProvider;
      await expect(
        new BitcoinCashCalculator(
          new TokenMap(),
          [addresses[0]],
          provider,
        ).getRawLockedAmountsPerAddress(nativeToken),
      ).rejects.toThrow('BCH treasury balance calculation failed');
    });

    /**
     * @target BitcoinCashCalculator.getRawLockedAmountsPerAddress rejects an
     * impossible aggregate balance
     * @dependencies Mock read-only provider.
     * @scenario Return maximum issuance independently at both addresses.
     * @expected Reject the aggregate instead of double-counting impossible funds.
     */
    it('rejects an impossible aggregate balance', async () => {
      const provider = { getAddressAssets: async () => ({ nativeToken: maxSatoshis, tokens: [] }) };
      await expect(
        new BitcoinCashCalculator(
          new TokenMap(),
          addresses,
          provider,
        ).getRawLockedAmountsPerAddress(nativeToken),
      ).rejects.toThrow('BCH treasury balance calculation failed');
    });

    /**
     * @target BitcoinCashCalculator.getRawLockedAmountsPerAddress rejects
     * partial failure after an earlier successful query
     * @dependencies Mock read-only provider.
     * @scenario Succeed once, then fail one address with sensitive diagnostic text.
     * @expected Second call rejects with fixed text and without retaining prior amounts.
     */
    it('rejects partial failure after an earlier successful query', async () => {
      let fail = false;
      const provider = {
        getAddressAssets: async (address: string) => {
          if (fail && address === addresses[1]) throw new Error('private credential diagnostic');
          return { nativeToken: 1n, tokens: [] };
        },
      };
      const calculator = new BitcoinCashCalculator(new TokenMap(), addresses, provider);
      expect(await calculator.getRawLockedAmountsPerAddress(nativeToken)).toHaveLength(2);
      fail = true;
      await expect(calculator.getRawLockedAmountsPerAddress(nativeToken)).rejects.toThrow(
        /^BCH treasury balance calculation failed$/,
      );
    });
  });

  describe.each(['totalRawSupply', 'totalRawBalance', 'getRawLockedAmountsPerAddress'] as const)(
    '%s',
    (method) => {
      /**
       * @target
       * BitcoinCashCalculator.totalRawSupply/totalRawBalance/getRawLockedAmountsPerAddress
       * rejects unsupported metadata %j
       * @dependencies Mock read-only provider.
       * @scenario Independently change asset type, token identifier, or source decimals.
       * @expected Reject before invoking the provider.
       */
      it.each([{ type: 'token' }, { tokenId: 'other' }, { decimals: 3 }])(
        'rejects unsupported metadata %j',
        async (override) => {
          const getAddressAssets = vi.fn();
          const calculator = new BitcoinCashCalculator(new TokenMap(), addresses, {
            getAddressAssets,
          });
          const token = { ...nativeToken, ...override };
          await expect(calculator[method](token)).rejects.toThrow('eight-decimal native BCH');
          expect(getAddressAssets).not.toHaveBeenCalled();
        },
      );
    },
  );

  describe.each(['totalRawSupply', 'totalRawBalance'] as const)('%s', (method) => {
    /**
     * @target BitcoinCashCalculator.totalRawSupply/totalRawBalance returns
     * zero for wrapped assets on the native source
     * @dependencies Mock read-only provider.
     * @scenario Query native supply or balance on the native calculator.
     * @expected Exact zero without a provider request.
     */
    it('returns zero for wrapped assets on the native source', async () => {
      const getAddressAssets = vi.fn();
      const calculator = new BitcoinCashCalculator(new TokenMap(), addresses, { getAddressAssets });
      expect(await calculator[method](nativeToken)).toEqual(0n);
      expect(getAddressAssets).not.toHaveBeenCalled();
    });
  });

  describe('getLockedAmountsPerAddress', () => {
    /**
     * @target BitcoinCashCalculator.getLockedAmountsPerAddress uses shared
     * token wrapping without truncating raw satoshis
     * @dependencies Real TokenMap with eight-decimal BCH and three-decimal wrapped fixture.
     * @scenario Query 100001 native satoshis then use inherited wrapped accounting.
     * @expected Raw amount remains exact and wrapped amount follows shared rounding to two units.
     */
    it('uses shared token wrapping without truncating raw satoshis', async () => {
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson([{ 'bitcoin-cash': nativeToken, ergo: wrappedToken }]);
      const calculator = new BitcoinCashCalculator(tokenMap, [addresses[0]], {
        getAddressAssets: async () => ({ nativeToken: 100001n, tokens: [] }),
      });
      expect(await calculator.getRawLockedAmountsPerAddress(nativeToken)).toEqual([
        { address: addresses[0], amount: 100001n },
      ]);
      expect(await calculator.getLockedAmountsPerAddress(nativeToken)).toEqual([
        { address: addresses[0], amount: 2n },
      ]);
    });
  });
});
