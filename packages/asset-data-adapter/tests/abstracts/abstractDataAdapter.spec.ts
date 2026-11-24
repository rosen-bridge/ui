import { TokenMap } from '@rosen-bridge/tokens';

import type { AssetBalance } from '../../lib/types';
import {
  sampleTokenMapConfig,
  sampleTokenMapConfigWithDuplicateTokenId,
  TestAdapter,
} from '../mocked';

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
     * - tokens of the chain without balance have an empty list
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
        // tokens of the chain without any balance map to an empty list
        ergo_token3: [],
        ergo_token4: [],
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
     * - the only key is the chain's own token (token3) with an empty list
     */
    it('should return empty balance for a token-id accidentally duplicated on another chain', async () => {
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson(sampleTokenMapConfigWithDuplicateTokenId);

      const adapter = new TestAdapter(['addr1', 'addr2'], tokenMap);

      // fetch tokens that exists on the tokenMap but on the another chain
      const result: AssetBalance = await adapter.fetch();

      expect(result).toEqual({ token3: [] });
    });

    /**
     * @target should map a zero-balance token to an empty list
     * @dependencies
     * - TestAdapter
     * - TokenMap
     * - getAddressAssets (mocked)
     * @scenario
     * - getAddressAssets returns token1 of the chain with balance 0n
     * - call fetch()
     * @expected
     * - token1 key exists with an empty list
     * - no zero-balance entry is produced
     */
    it('should map a zero-balance token to an empty list', async () => {
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson(sampleTokenMapConfig);
      const adapter = new TestAdapter(['addr1'], tokenMap);
      adapter.getAddressAssets = vi.fn().mockResolvedValue([{ assetId: 'token1', balance: 0n }]);

      const result: AssetBalance = await adapter.fetch();

      expect(result.token1).toEqual([]);
    });

    /**
     * @target should map a token not returned by any address to an empty list
     * @dependencies
     * - TestAdapter
     * - TokenMap
     * - getAddressAssets (mocked)
     * @scenario
     * - getAddressAssets returns no assets
     * - call fetch()
     * @expected
     * - every token of the chain in the token map has an empty list
     */
    it('should map a token not returned by any address to an empty list', async () => {
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson(sampleTokenMapConfig);
      const adapter = new TestAdapter(['addr1'], tokenMap);
      adapter.getAddressAssets = vi.fn().mockResolvedValue([]);

      const result: AssetBalance = await adapter.fetch();

      expect(result).toEqual({
        token1: [],
        ergo_token2: [],
        ergo_token3: [],
        ergo_token4: [],
      });
    });

    /**
     * @target should list only holding address when another has zero balance
     * @dependencies
     * - TestAdapter
     * - TokenMap
     * - getAddressAssets (mocked)
     * @scenario
     * - addr1 holds token1 (100n), addr2 holds token1 with balance 0n
     * - call fetch()
     * @expected
     * - token1 has only the addr1 entry
     */
    it('should list only holding address when another has zero balance', async () => {
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson(sampleTokenMapConfig);
      const adapter = new TestAdapter(['addr1', 'addr2'], tokenMap);
      adapter.getAddressAssets = vi
        .fn()
        .mockImplementation(async (address: string) => [
          { assetId: 'token1', balance: address === 'addr1' ? 100n : 0n },
        ]);

      const result: AssetBalance = await adapter.fetch();

      expect(result.token1).toEqual([{ address: 'addr1', balance: 100n }]);
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
     * - result length must be equal to the wrapped-tokens of the chain
     * - items of result must be as expected value
     */
    it('should return totalSupply for all tokens on the chain', async () => {
      const mockTokenMap = new TokenMap();
      await mockTokenMap.updateConfigByJson(sampleTokenMapConfig);

      const adapter = new TestAdapter(['0xAddress'], mockTokenMap);

      const result = await adapter.getAllTokensTotalSupply();

      const chainWrappedTokens = adapter['getAllWrappedTokens']();

      expect(Object.keys(result)).toHaveLength(3);
      expect(chainWrappedTokens.length).toEqual(3);

      result.forEach((v) => {
        const wrappedAmount = mockTokenMap.wrapAmount(v.assetId, 5000n, adapter.chain);
        expect(v).toEqual({
          assetId: v.assetId,
          totalSupply: wrappedAmount.amount,
        });
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
      const mockTokenMap = new TokenMap();
      await mockTokenMap.updateConfigByJson(sampleTokenMapConfig);

      const adapter = new TestAdapter(['0xAddress'], mockTokenMap);

      adapter.getRawTotalSupply = vi.fn().mockImplementation(() => {
        throw new Error();
      });

      await expect(adapter.getAllTokensTotalSupply()).rejects.toThrow();
    });
  });
});
