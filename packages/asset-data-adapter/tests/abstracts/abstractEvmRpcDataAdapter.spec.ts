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

    /**
     * @target should paginate address assets using offset
     * @scenario
     * - call adapter.getAddressAssets to return a list of all assets
     * - call adapterByFetchParameters.getAddressAssets repeatedly:
     *   1. first call → expect the first asset
     *   2. second call → expect the second asset
     *   3. third call → expect the third asset
     *   4. third call → expect the first asset
     * @expected
     * - offset increases on each fetch
     */
    it<TestContext>('should paginate address assets using offset', async ({
      adapter,
      mockTokenMap,
    }) => {
      const adapterByFetchParameters = new TestEvmRpcAdapter(
        ['0xAddress'],
        mockTokenMap,
        'http://rpc',
        undefined,
        1,
      );

      const totalAssets = await adapter.getAddressAssets('0xAddress');

      let assets = await adapterByFetchParameters.getAddressAssets('0xAddress');
      expect(assets).toEqual([totalAssets[0]]);

      assets = await adapterByFetchParameters.getAddressAssets('0xAddress');
      expect(assets).toEqual([totalAssets[1]]);

      assets = await adapterByFetchParameters.getAddressAssets('0xAddress');
      expect(assets).toEqual([totalAssets[2]]);

      assets = await adapterByFetchParameters.getAddressAssets('0xAddress');
      expect(assets).toEqual([totalAssets[0]]);
    });

    /**
     * @target should respect initial fetchOffset and return assets accordingly
     * @scenario
     * - mock adapter.getAddressAssets to return a list of 3 assets
     * - adapterByFetchParameters is initialized with an offset near the end
     * - first call to getAddressAssets:
     *   - expect it to return the last chunk (totalAssets.slice(2))
     * - second call to getAddressAssets:
     *   - expect it to return only the final asset [totalAssets[2]]
     * @expected
     * - fetch starts at the configured offset
     * - subsequent calls continue correctly from that offset
     */
    it<TestContext>('should respect initial fetchOffset and return assets accordingly', async ({
      adapter,
      mockTokenMap,
    }) => {
      const adapterByFetchParameters = new TestEvmRpcAdapter(
        ['0xAddress'],
        mockTokenMap,
        'http://rpc',
        undefined,
        2,
      );

      const totalAssets = await adapter.getAddressAssets('0xAddress');

      let assets = await adapterByFetchParameters.getAddressAssets('0xAddress');
      expect(assets).toEqual(totalAssets.slice(0, 2));

      assets = await adapterByFetchParameters.getAddressAssets('0xAddress');
      expect(assets).toEqual([totalAssets[2]]);
    });
  });
});
