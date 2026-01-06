import { TokenMap } from '@rosen-bridge/tokens';
import { NETWORKS } from '@rosen-ui/constants';
import { describe, it, expect, vi } from 'vitest';

import { ERG_TOTAL_SUPPLY } from '../../lib/constants';
import { AssetBalance } from '../../lib/types';
import {
  sampleTokenMapConfig,
  sampleTokenMapConfigWithDuplicateTokenId,
  TestEvmRpcAdapter,
} from '../mocked';
import { TestAdapter } from '../mocked';

describe('AbstractDataAdapter', () => {
  describe('fetch', () => {
    /**
     * @target should aggregate balances after unwrapping decimals and group by assetId
     * @scenario
     * - define two addresses (addr1, addr2) with balances:
     *   - addr1 has token0=100n, token1=100n and token2=200n
     *   - addr2 has token0=300n and token1=50n
     * - tokenMap contains both token1 and token2
     * - call fetch()
     * @expected
     * - result groups balances by assetId and ignore token0 and also ignore tokens by zero amount
     */
    it('should aggregate balances after unwrapping decimals and group by assetId', async () => {
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson(sampleTokenMapConfig);

      const adapter = new TestAdapter(['addr1', 'addr2'], tokenMap);

      // fetch tokens that exists on the tokenMap
      const result: AssetBalance = await adapter.fetch();

      expect(result).toEqual({
        token1: [
          // in results decimals length not changed for token1
          { address: 'addr1', balance: 100n },
          { address: 'addr2', balance: 50n },
        ],
        ergo_token2: [
          // in results wrapped decimals length to 3 for token2
          // and used ergo token-id for token2 in this results
          { address: 'addr1', balance: 200n },
        ],
      });
    });

    /**
     * @target should return empty balance for a token-id accidentally duplicated on another chain
     * @scenario
     * - tokenMap contains token3 which belongs to another chain
     * - its mapped id is cardano_token3
     * - on the native chain there also exists a token with the same id cardano_token3
     * - address balance includes some of cardano_token3 token value
     * - call fetch()
     * @expected
     * - result must return empty balance for cardano_token3 since it is associated with another chain
     */
    it('should return empty balance for a token-id accidentally duplicated on another chain', async () => {
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson(
        sampleTokenMapConfigWithDuplicateTokenId,
      );

      const adapter = new TestAdapter(['addr1', 'addr2'], tokenMap);

      // fetch tokens that exists on the tokenMap but on the another chain
      const result: AssetBalance = await adapter.fetch();

      expect(result).toEqual({});
    });
  });

  describe('getAllTokensTotalSupply', () => {
    /**
     * @target should return totalSupply for all tokens on the chain
     * @scenario
     * - tokenMap initialized
     * - create instance from simple TestAdapter
     * - call the getAllTokensTotalSupply method of the adapter
     * @expected
     * - result length must be equal to the tokens of the chain
     * - items of result must be as expected value
     */
    it('should return totalSupply for all tokens on the chain', async () => {
      const mockTokenMap = new TokenMap();
      await mockTokenMap.updateConfigByJson(sampleTokenMapConfig);

      const adapter = new TestAdapter(['0xAddress'], mockTokenMap);

      const result = await adapter.getAllTokensTotalSupply();

      const chainWrappedTokens = adapter['getAllWrappedTokens']();

      expect(Object.keys(result)).toHaveLength(chainWrappedTokens.length + 1); // plus one native token

      Object.entries(result).forEach(([k, v]) => {
        expect(v).toStrictEqual(
          mockTokenMap.wrapAmount(
            k,
            k == NETWORKS.ergo.nativeToken ? ERG_TOTAL_SUPPLY : 5000n,
            adapter.chain,
          ),
        );
      });
    });

    /**
     * @target should throw if one of the token's totalSupply cannot be fetched
     * @scenario
     * - Mock the totalSupply method to return undefined at second call
     * - create an instance of the TestEvmRpcAdapter
     * - call the getAllTokensTotalSupply method of the adapter
     * @expected
     * - calling getAllTokensTotalSupply is expected to throw an error
     */
    it('should throw if any token totalSupply cannot be fetched', async () => {
      const totalSupplyMock = vi
        .fn()
        .mockResolvedValueOnce(5000n)
        .mockResolvedValueOnce(undefined);

      vi.doMock('ethers', () => {
        const Contract = vi.fn().mockImplementation(() => ({
          totalSupply: totalSupplyMock,
        }));
        const JsonRpcProvider = vi.fn().mockImplementation(() => ({}));

        return { ethers: { Contract }, Contract, JsonRpcProvider };
      });

      const mockTokenMap = new TokenMap();
      await mockTokenMap.updateConfigByJson(sampleTokenMapConfig);

      const adapter = new TestEvmRpcAdapter(
        ['0xAddress'],
        mockTokenMap,
        { url: 'http://rpc', authToken: '' },
        100,
      );

      await expect(adapter.getAllTokensTotalSupply()).rejects.toThrow();
    });
  });
});
