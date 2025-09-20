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
});
