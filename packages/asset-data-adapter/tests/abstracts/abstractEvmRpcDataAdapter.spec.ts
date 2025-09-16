import { TokenMap } from '@rosen-bridge/tokens';
import { describe, it, beforeEach, expect, vi } from 'vitest';

import { AbstractDataAdapter } from '../../lib';
import { ChainAssetBalance } from '../../lib/types';
import { sampleTokenMapConfig } from '../mocked';
import { expectedGetAddressAssetsResult, TestEvmRpcAdapter } from '../mocked';

interface TestContext {
  adapter: AbstractDataAdapter;
  mockTokenMap: TokenMap;
}

describe('AbstractEvmRpcDataAdapter', () => {
  describe('getAddressAssets', () => {
    beforeEach<TestContext>(async (ctx) => {
      vi.mock('ethers', () => {
        const balanceOf = vi.fn().mockResolvedValue(BigInt(2000));
        const getBalance = vi.fn().mockResolvedValue(BigInt(1000));
        const Contract = vi.fn().mockImplementation(() => ({ balanceOf }));
        const JsonRpcProvider = vi
          .fn()
          .mockImplementation(() => ({ getBalance }));

        return {
          ethers: { Contract },
          Contract,
          JsonRpcProvider,
        };
      });

      ctx.mockTokenMap = new TokenMap();
      await ctx.mockTokenMap.updateConfigByJson(sampleTokenMapConfig);

      ctx.adapter = new TestEvmRpcAdapter(
        ['0xAddress'],
        ctx.mockTokenMap,
        'http://rpc',
      );
    });

    /**
     * @target should fetch balances for native and ERC20 tokens
     * @scenario
     * - tokenMap contains two ERC20 and one native token
     * - call the getAddressAssets method of derived class
     * @expected
     * - result should include both tokens with their correct balances
     *   and ignore third token not exists on the token map
     */
    it<TestContext>('should fetch balances for native and ERC20 tokens', async ({
      adapter,
    }) => {
      const assets = await adapter.getAddressAssets('0xAddress');

      expect(assets).toEqual(expectedGetAddressAssetsResult);
      expect(assets.map((a: ChainAssetBalance) => a.assetId)).not.toContain(
        '0xUnknown',
      );
    });
  });
});
