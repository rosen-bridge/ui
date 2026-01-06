import { TokenMap } from '@rosen-bridge/tokens';
import { describe, it, beforeEach, expect, vi } from 'vitest';

import { CardanoKoiosDataAdapter } from '../lib';
import { sampleTokenMapConfig } from './mocked';
import {
  CardanoAdapterGetAddressAssetsResult,
  CardanoAddressInfoMockValue,
  koiosAPIAddressAssetsMockedData,
} from './mocked/cardanoKoiosDataAdapter.mock';

interface TestContext {
  adapter: CardanoKoiosDataAdapter;
  mockTokenMap: TokenMap;
}

let mockKoios = {
  addressInfo: vi.fn().mockReturnValue(CardanoAddressInfoMockValue),
  addressAssets: vi.fn().mockReturnValue(koiosAPIAddressAssetsMockedData),
};

describe('CardanoKoiosDataAdapter', () => {
  beforeEach<TestContext>(async (ctx) => {
    vi.mock('@rosen-clients/cardano-koios', () => ({
      default: vi.fn(() => mockKoios),
    }));

    ctx.mockTokenMap = new TokenMap();
    await ctx.mockTokenMap.updateConfigByJson(sampleTokenMapConfig);

    ctx.adapter = new CardanoKoiosDataAdapter(['addr1'], ctx.mockTokenMap, {
      koiosUrl: 'http://koios',
      authToken: 'mocked-token',
    });
  });

  describe('getAddressAssets', () => {
    /**
     * @target should fetch balances for native and multiple token assets
     * @scenario
     * - koiosApi returns cardano balance and multiple tokens
     * @expected
     * - result includes native Cardano and all tokens with balances
     */
    it<TestContext>('should fetch balances for native and multiple token assets', async ({
      adapter,
    }) => {
      const result = await adapter.getAddressAssets('addr1');

      expect(result).toEqual(CardanoAdapterGetAddressAssetsResult);
    });
  });

  describe('getRawTotalSupply', () => {
    it<TestContext>('should return total supply for existing wrapped token' /**
     * @target should return total supply for existing wrapped token
     * @scenario
     * - adapter.koiosApi.assetInfo is mocked to return a single asset with total_supply
     * - token.extra.policyId and token.extra.assetName match the mocked asset
     * @expected
     * - method returns the total_supply as bigint
     * - assetInfo is called with correct _asset_list parameter
     */, async ({ adapter }) => {
      const token = adapter['getAllWrappedTokens']().at(0)!;

      adapter['koiosApi'].assetInfo = vi
        .fn()
        .mockResolvedValue([{ total_supply: '123456789' }]);

      const result = await adapter.getRawTotalSupply(token);

      expect(result).toBe(123456789n);
      expect(adapter['koiosApi'].assetInfo).toHaveBeenCalledWith({
        _asset_list: [['policy1', 'token1']],
      });
    });

    it<TestContext>('should throw if assetInfo returns empty array' /**
     * @target should throw if assetInfo returns empty array
     * @scenario
     * - adapter.koiosApi.assetInfo is mocked to return []
     * - token.extra.policyId and token.extra.assetName are given
     * @expected
     * - method throws an error indicating total supply is not calculable
     */, async ({ adapter }) => {
      const token = adapter['getAllWrappedTokens']().at(0)!;

      adapter['koiosApi'].assetInfo = vi.fn().mockResolvedValue([]);

      await expect(adapter.getRawTotalSupply(token)).rejects.toThrow();
    });

    it<TestContext>('should throw if assetInfo returns object without total_supply' /**
     * @target should throw if assetInfo returns object without total_supply
     * @scenario
     * - adapter.koiosApi.assetInfo is mocked to return [{}]
     * - token.extra.policyId and token.extra.assetName are given
     * @expected
     * - method throws an error indicating total supply is not calculable
     */, async ({ adapter }) => {
      const token = adapter['getAllWrappedTokens']().at(0)!;

      adapter['koiosApi'].assetInfo = vi.fn().mockResolvedValue([{}]);

      await expect(adapter.getRawTotalSupply(token)).rejects.toThrow();
    });
  });
});
