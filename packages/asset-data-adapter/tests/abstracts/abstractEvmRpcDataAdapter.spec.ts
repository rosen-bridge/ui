import type { Mock } from 'vitest';

import { TokenMap } from '@rosen-bridge/tokens';

import type { ChainAssetBalance } from '../../lib';
import { expectedGetAddressAssetsResult, sampleTokenMapConfig, TestEvmRpcAdapter } from '../mocked';

interface TestContext {
  adapter: TestEvmRpcAdapter;
  mockTokenMap: TokenMap;
  mockedTotalSupply: Mock;
  mockedBalanceOf: Mock;
}

const mockedTotalSupplyMock = vi.fn();
const mockedBalanceOfMock = vi.fn();

describe('AbstractEvmRpcDataAdapter', () => {
  beforeEach<TestContext>(async (ctx) => {
    ctx.mockedTotalSupply = mockedTotalSupplyMock;
    ctx.mockedBalanceOf = mockedBalanceOfMock;
    mockedBalanceOfMock.mockReset();
    mockedBalanceOfMock.mockResolvedValue(BigInt(2000));

    vi.mock('ethers', () => {
      const getBalance = vi.fn().mockResolvedValue(BigInt(1000));
      const Contract = vi.fn().mockImplementation(() => ({
        balanceOf: (...args: unknown[]) => mockedBalanceOfMock(...args),
        totalSupply: mockedTotalSupplyMock,
      }));
      const JsonRpcProvider = vi.fn().mockImplementation(() => ({ getBalance }));

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
      { url: 'http://rpc', authToken: '' },
      100,
    );
  });

  describe('getAddressAssets', () => {
    /**
     * @target should fetch balances for native and ERC20 tokens
     * @scenario
     * - tokenMap contains two ERC20 and one native token
     * - call the getAddressAssets method of derived class
     * @expected
     * - result should include both tokens with their correct balances
     *   and ignore third token not exists on the token map
     */
    it<TestContext>('should fetch balances for native and ERC20 tokens', async ({ adapter }) => {
      const assets = await adapter.getAddressAssets('0xAddress');

      expect(assets).toEqual(expectedGetAddressAssetsResult);
      expect(assets.map((a: ChainAssetBalance) => a.assetId)).not.toContain('0xUnknown');
    });

    /**
     * @target should fetch balances in chunks for multiple addresses
     * @scenario
     * - create an adapter with two addresses and chunkSize 1
     * - call getAddressAssets for both addresses three times in turn
     * @expected
     * - every call returns all supported tokens
     * - each call fetches the balance of the next token only (round-robin),
     *   others keep their cached balance (initially zero)
     * - fetch offsets of the two addresses are independent
     */
    it<TestContext>('should fetch balances in chunks for multiple addresses', async ({
      mockTokenMap,
    }) => {
      const adapter = new TestEvmRpcAdapter(
        ['0xAddress1', '0xAddress2'],
        mockTokenMap,
        { url: 'http://rpc', authToken: '' },
        1,
      );
      const ids = expectedGetAddressAssetsResult.map((item) => item.assetId);
      const expected = (fetched: number) =>
        ids.map((assetId, index) => ({ assetId, balance: index < fetched ? 2000n : 0n }));

      for (let fetched = 1; fetched <= ids.length; fetched++) {
        expect(await adapter.getAddressAssets('0xAddress1')).toEqual(expected(fetched));
        expect(await adapter.getAddressAssets('0xAddress2')).toEqual(expected(fetched));
      }
    });

    /**
     * @target should wrap around the supported tokens when reaching the end
     * @scenario
     * - create an adapter with chunkSize 2 and three supported tokens
     * - call getAddressAssets twice, then change the mocked balance and call once more
     * @expected
     * - first call fetches the first two tokens
     * - second call fetches the third token and the first token again
     * - third call fetches the second and third tokens with the new balance
     */
    it<TestContext>('should wrap around the supported tokens when reaching the end', async ({
      mockTokenMap,
      mockedBalanceOf,
    }) => {
      const adapter = new TestEvmRpcAdapter(
        ['0xAddress'],
        mockTokenMap,
        { url: 'http://rpc', authToken: '' },
        2,
      );
      const [first, second, third] = expectedGetAddressAssetsResult.map((item) => item.assetId);

      expect(await adapter.getAddressAssets('0xAddress')).toEqual([
        { assetId: first, balance: 2000n },
        { assetId: second, balance: 2000n },
        { assetId: third, balance: 0n },
      ]);

      mockedBalanceOf.mockResolvedValue(BigInt(3000));
      expect(await adapter.getAddressAssets('0xAddress')).toEqual([
        { assetId: first, balance: 3000n },
        { assetId: second, balance: 2000n },
        { assetId: third, balance: 3000n },
      ]);

      mockedBalanceOf.mockResolvedValue(BigInt(4000));
      expect(await adapter.getAddressAssets('0xAddress')).toEqual([
        { assetId: first, balance: 3000n },
        { assetId: second, balance: 4000n },
        { assetId: third, balance: 4000n },
      ]);
    });

    /**
     * @target should not fetch a token more than once when chunkSize exceeds supported tokens
     * @scenario
     * - create an adapter with chunkSize larger than the number of supported tokens
     * - call getAddressAssets once
     * @expected
     * - balanceOf is called exactly once per supported ERC20 token
     * - no token is fetched more than once
     */
    it<TestContext>('should not fetch a token more than once when chunkSize exceeds supported tokens', async ({
      mockTokenMap,
      mockedBalanceOf,
    }) => {
      const adapter = new TestEvmRpcAdapter(
        ['0xAddress'],
        mockTokenMap,
        { url: 'http://rpc', authToken: '' },
        10,
      );

      mockedBalanceOf.mockClear();

      await adapter.getAddressAssets('0xAddress');

      const erc20Count = expectedGetAddressAssetsResult.filter(
        (item) => item.assetId !== 'ethereum_native',
      ).length;

      expect(mockedBalanceOf).toHaveBeenCalledTimes(erc20Count);
    });

    /**
     * @target should apply fetched balance for a newly listed token in the same cycle
     * @scenario
     * - initialize the cache with a token map that does not include the last ethereum token
     * - call getAddressAssets to populate the cache
     * - update the token map to include the previously missing token
     * - call getAddressAssets again with a chunkSize large enough to cover all tokens
     * @expected
     * - the newly listed token appears in the result with the fetched balance (not zero)
     */
    it<TestContext>('should apply fetched balance for a newly listed token in the same cycle', async ({
      mockTokenMap,
      mockedBalanceOf,
    }) => {
      const tokenMapWithoutLast = sampleTokenMapConfig.filter(
        (tokenSet) => tokenSet.ethereum?.tokenId !== 'ethereum_token4',
      );
      await mockTokenMap.updateConfigByJson(tokenMapWithoutLast);

      const adapter = new TestEvmRpcAdapter(
        ['0xAddress'],
        mockTokenMap,
        { url: 'http://rpc', authToken: '' },
        100,
      );

      await adapter.getAddressAssets('0xAddress');

      await mockTokenMap.updateConfigByJson(sampleTokenMapConfig);

      mockedBalanceOf.mockResolvedValue(5000n);

      const assets = await adapter.getAddressAssets('0xAddress');

      const newToken = assets.find((a) => a.assetId === 'ethereum_token4');
      expect(newToken).toBeDefined();
      expect(newToken?.balance).toBe(5000n);
    });

    /**
     * @target should keep the cached balance when fetching a token fails
     * @scenario
     * - fetch all balances once
     * - mock balanceOf to reject for the next call
     * - call getAddressAssets again
     * @expected
     * - the error is swallowed and the previously cached balances are returned
     */
    it<TestContext>('should keep the cached balance when fetching a token fails', async ({
      adapter,
      mockedBalanceOf,
    }) => {
      await adapter.getAddressAssets('0xAddress');

      mockedBalanceOf.mockRejectedValue(new Error('rpc error'));
      const assets = await adapter.getAddressAssets('0xAddress');

      expect(assets).toEqual(expectedGetAddressAssetsResult);
    });

    /**
     * @target should return a copy of the cached balances
     * @scenario
     * - call getAddressAssets and mutate the returned balances
     * @expected
     * - the internal cache is not changed
     */
    it<TestContext>('should return a copy of the cached balances', async ({ adapter }) => {
      const assets = await adapter.getAddressAssets('0xAddress');
      assets[0].balance = 1n;

      expect(adapter.getTotalAssets()['0xAddress']).toEqual(expectedGetAddressAssetsResult);
    });
  });

  describe('initialize', () => {
    /**
     * @target should add a zero balance for every supported token of the address
     * @scenario
     * - call initialize for an address
     * @expected
     * - cache of the address contains all supported tokens of the chain with zero balance
     * - other addresses are not affected
     */
    it<TestContext>('should add a zero balance for every supported token of the address', ({
      adapter,
    }) => {
      adapter.setTotalAssets({ '0xOther': [{ assetId: 'token2', balance: 5n }] });

      adapter.callInitialize('0xAddress');

      expect(adapter.getTotalAssets()).toEqual({
        '0xOther': [{ assetId: 'token2', balance: 5n }],
        '0xAddress': expectedGetAddressAssetsResult.map(({ assetId }) => ({
          assetId,
          balance: 0n,
        })),
      });
    });

    /**
     * @target should reset existing balances of the address
     * @scenario
     * - set a non-zero cached balance for an address
     * - call initialize for that address
     * @expected
     * - all balances of the address are zero
     */
    it<TestContext>('should reset existing balances of the address', ({ adapter }) => {
      adapter.setTotalAssets({ '0xAddress': [{ assetId: 'token2', balance: 5n }] });

      adapter.callInitialize('0xAddress');

      expect(
        adapter
          .getTotalAssets()
          ['0xAddress'].every((item: ChainAssetBalance) => item.balance === 0n),
      ).toBe(true);
    });
  });

  describe('updateTokenBalance', () => {
    /**
     * @target should update only the balance of the given token
     * @scenario
     * - initialize an address
     * - call updateTokenBalance for one of its tokens
     * @expected
     * - balance of the given token is updated
     * - balances of other tokens remain zero
     */
    it<TestContext>('should update only the balance of the given token', ({ adapter }) => {
      adapter.callInitialize('0xAddress');

      adapter.callUpdateTokenBalance('0xAddress', 'ethereum_token3', 42n);

      expect(adapter.getTotalAssets()['0xAddress']).toEqual([
        { assetId: 'token2', balance: 0n },
        { assetId: 'ethereum_token3', balance: 42n },
        { assetId: 'ethereum_token4', balance: 0n },
      ]);
    });

    /**
     * @target should not change the cache for an unknown token
     * @scenario
     * - initialize an address
     * - call updateTokenBalance with a token not present in the cache
     * @expected
     * - cache remains unchanged and no entry is added
     */
    it<TestContext>('should not change the cache for an unknown token', ({ adapter }) => {
      adapter.callInitialize('0xAddress');
      const before = structuredClone(adapter.getTotalAssets());

      adapter.callUpdateTokenBalance('0xAddress', '0xUnknown', 42n);

      expect(adapter.getTotalAssets()).toEqual(before);
    });

    /**
     * @target should not change balances of other addresses
     * @scenario
     * - initialize two addresses
     * - call updateTokenBalance for the first address
     * @expected
     * - only the first address balance is updated
     */
    it<TestContext>('should not change balances of other addresses', ({ adapter }) => {
      adapter.callInitialize('0xAddress1');
      adapter.callInitialize('0xAddress2');

      adapter.callUpdateTokenBalance('0xAddress1', 'token2', 7n);

      expect(adapter.getTotalAssets()['0xAddress1'][0]).toEqual({ assetId: 'token2', balance: 7n });
      expect(adapter.getTotalAssets()['0xAddress2'][0]).toEqual({ assetId: 'token2', balance: 0n });
    });
  });

  describe('removeUnlistedAndAddNew', () => {
    /**
     * @target should remove tokens that are not in the token map
     * @scenario
     * - set cached balances containing a token not in the token map for two addresses
     * - call removeUnlistedAndAddNew
     * @expected
     * - unlisted token is removed from all addresses
     * - balances of listed tokens are preserved
     */
    it<TestContext>('should remove tokens that are not in the token map', ({ adapter }) => {
      adapter.setTotalAssets({
        '0xAddress1': [
          { assetId: 'token2', balance: 1n },
          { assetId: '0xUnknown', balance: 2n },
          { assetId: 'ethereum_token3', balance: 3n },
          { assetId: 'ethereum_token4', balance: 4n },
        ],
        '0xAddress2': [
          { assetId: '0xUnknown', balance: 5n },
          { assetId: 'token2', balance: 6n },
          { assetId: 'ethereum_token3', balance: 7n },
          { assetId: 'ethereum_token4', balance: 8n },
        ],
      });

      adapter.callRemoveUnlistedAndAddNew();

      expect(adapter.getTotalAssets()).toEqual({
        '0xAddress1': [
          { assetId: 'token2', balance: 1n },
          { assetId: 'ethereum_token3', balance: 3n },
          { assetId: 'ethereum_token4', balance: 4n },
        ],
        '0xAddress2': [
          { assetId: 'token2', balance: 6n },
          { assetId: 'ethereum_token3', balance: 7n },
          { assetId: 'ethereum_token4', balance: 8n },
        ],
      });
    });

    /**
     * @target should add newly listed tokens with zero balance
     * @scenario
     * - set cached balances missing some tokens of the token map
     * - call removeUnlistedAndAddNew
     * @expected
     * - missing tokens are appended with zero balance
     * - existing balances are preserved
     */
    it<TestContext>('should add newly listed tokens with zero balance', ({ adapter }) => {
      adapter.setTotalAssets({
        '0xAddress': [{ assetId: 'ethereum_token3', balance: 3n }],
      });

      adapter.callRemoveUnlistedAndAddNew();

      expect(adapter.getTotalAssets()['0xAddress']).toEqual([
        { assetId: 'ethereum_token3', balance: 3n },
        { assetId: 'token2', balance: 0n },
        { assetId: 'ethereum_token4', balance: 0n },
      ]);
    });

    /**
     * @target should sync the cache after the token map is updated
     * @scenario
     * - fetch balances of an address
     * - update the token map to drop the last ethereum token
     * - call removeUnlistedAndAddNew
     * - restore the token map and call removeUnlistedAndAddNew again
     * @expected
     * - dropped token is removed from the cache
     * - after restoring, the token is added back with zero balance
     */
    it<TestContext>('should sync the cache after the token map is updated', async ({
      adapter,
      mockTokenMap,
    }) => {
      await adapter.getAddressAssets('0xAddress');

      await mockTokenMap.updateConfigByJson(
        sampleTokenMapConfig.filter((tokenSet) => tokenSet.ethereum?.tokenId !== 'ethereum_token4'),
      );
      adapter.callRemoveUnlistedAndAddNew();

      expect(adapter.getTotalAssets()['0xAddress']).toEqual([
        { assetId: 'token2', balance: 2000n },
        { assetId: 'ethereum_token3', balance: 2000n },
      ]);

      await mockTokenMap.updateConfigByJson(sampleTokenMapConfig);
      adapter.callRemoveUnlistedAndAddNew();

      expect(adapter.getTotalAssets()['0xAddress']).toEqual([
        { assetId: 'token2', balance: 2000n },
        { assetId: 'ethereum_token3', balance: 2000n },
        { assetId: 'ethereum_token4', balance: 0n },
      ]);
    });
  });

  describe('getRawTotalSupply', () => {
    /**
     * @target should return raw totalSupply for wrapped token
     * @scenario
     * - get a wrapped token from the token map
     * - mock the totalSupply method to return a bigint value
     * - call the getRawTotalSupply method of the adapter
     * @expected
     * - getRawTotalSupply returns the mocked raw totalSupply value
     */
    it<TestContext>('should return raw totalSupply for wrapped token', async ({
      adapter,
      mockTokenMap,
      mockedTotalSupply,
    }) => {
      const wrappedToken = mockTokenMap.getTokens('ethereum', 'ethereum')[0];

      mockedTotalSupply.mockResolvedValue(9999n);

      const result = await adapter.getRawTotalSupply(wrappedToken);

      expect(result).toBe(9999n);
    });

    /**
     * @target should throw if totalSupply cannot be fetched
     * @scenario
     * - get a wrapped token from the token map
     * - mock the totalSupply method to return undefined
     * - call the getRawTotalSupply method of the adapter
     * @expected
     * - calling getRawTotalSupply throws an error
     */
    it<TestContext>('should throw if totalSupply cannot be fetched', async ({
      adapter,
      mockTokenMap,
      mockedTotalSupply,
    }) => {
      const wrappedToken = mockTokenMap.getTokens('ethereum', 'ethereum')[0];

      mockedTotalSupply.mockResolvedValue(undefined);

      await expect(adapter.getRawTotalSupply(wrappedToken)).rejects.toThrow();
    });
  });
});
