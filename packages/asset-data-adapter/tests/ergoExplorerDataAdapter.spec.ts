import { TokenMap } from '@rosen-bridge/tokens';
import { describe, it, beforeEach, expect, vi, Mock } from 'vitest';

import { ErgoExplorerDataAdapter } from '../lib';
import { sampleTokenMapConfig } from './mocked';
import {
  expectedErgoExplorerGetAddressAssetsResult,
  expectedErgoGetAddressAssetsResult,
} from './mocked/ergoExplorerDataAdapter.mock';

interface TestContext {
  adapter: ErgoExplorerDataAdapter;
  mockTokenMap: TokenMap;
  mockExplorer: { v1: { [k: string]: Mock } };
}

let mockExplorer = {
  v1: {
    getApiV1AddressesP1BalanceConfirmed: vi.fn(),
    getApiV1TokensP1: vi.fn(),
  },
};

describe('ErgoExplorerDataAdapter', () => {
  beforeEach<TestContext>(async (ctx) => {
    vi.mock('@rosen-clients/ergo-explorer', () => ({
      default: vi.fn(() => mockExplorer),
    }));

    mockExplorer.v1.getApiV1AddressesP1BalanceConfirmed.mockResolvedValue(
      expectedErgoExplorerGetAddressAssetsResult,
    );

    ctx.mockTokenMap = new TokenMap();
    await ctx.mockTokenMap.updateConfigByJson(sampleTokenMapConfig);

    ctx.adapter = new ErgoExplorerDataAdapter(
      ['addr1'],
      ctx.mockTokenMap,
      'http://explorer',
    );

    ctx.mockExplorer = mockExplorer;
  });

  describe('getAddressAssets', () => {
    /**
     * @target should fetch balances for native and multiple token assets
     * @scenario
     * - explorerApi returns nanoErgs and multiple tokens
     * @expected
     * - result includes native ERG and all tokens with balances
     */
    it<TestContext>('should fetch balances for native and multiple token assets', async ({
      adapter,
    }) => {
      const result = await adapter.getAddressAssets('addr1');

      expect(result).toEqual(expectedErgoGetAddressAssetsResult);
    });
  });
});
