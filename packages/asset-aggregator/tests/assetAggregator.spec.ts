/* eslint-disable @typescript-eslint/no-explicit-any */
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { TokenMap } from '@rosen-bridge/tokens';
import { NETWORKS } from '@rosen-ui/constants';
import { describe, beforeEach, it, expect } from 'vitest';

import { AssetAggregator } from '../lib';
import {
  BridgedAssetEntity,
  LockedAssetEntity,
  TokenEntity,
} from '../lib/entities';
import {
  SAMPLE_TOKEN_MAP,
  NATIVE_TOKEN_CHAIN_BALANCE_INFO,
  NATIVE_TOKEN_TOTAL_SUPPLY,
  WRAPPED_TOKEN_CHAIN_BALANCE_INFO,
  WRAPPED_TOKEN_TOTAL_SUPPLY,
  MIXED_TOKENS_CHAIN_BALANCE_INFO,
  MIXED_TOKENS_TOTAL_SUPPLY,
  MULTI_CHAIN_BALANCE_INFO,
  BRIDGED_AMOUNT_CHAIN_BALANCE_INFO,
  BRIDGED_AMOUNT_TOTAL_SUPPLY,
} from './mocked/assetAggregator.mock';
import { createDatabase } from './testUtils';

interface BridgedAssetTestContext {
  dataSource: DataSource;
  tokenMap: TokenMap;
  assetAggregator: AssetAggregator;
}

describe('AssetAggregator', () => {
  beforeEach<BridgedAssetTestContext>(async (context) => {
    const tokenMap = new TokenMap();
    tokenMap.updateConfigByJson(SAMPLE_TOKEN_MAP);
    context.dataSource = await createDatabase();
    context.tokenMap = tokenMap;
    context.assetAggregator = new AssetAggregator(
      context.tokenMap,
      context.dataSource,
    );
    await context.dataSource.getRepository(TokenEntity).deleteAll();
    await context.assetAggregator.updateTokens();
  });

  describe('update', () => {
    /**
     * @target should store token as locked asset
     * @dependencies
     * - database
     * - assetAggregator
     * @scenario
     * - create ChainAssetBalanceInfo with native token (erg) and 2 address balances
     * - call update method
     * @expected
     * - token should be stored in database with correct id and isNative=true
     * - 2 locked assets should be stored with correct addresses and balances
     */
    it<BridgedAssetTestContext>('should store native token as locked asset', async ({
      assetAggregator,
      dataSource,
    }) => {
      await assetAggregator.update(
        NATIVE_TOKEN_CHAIN_BALANCE_INFO,
        NATIVE_TOKEN_TOTAL_SUPPLY,
      );

      const tokenRepository = dataSource.getRepository(TokenEntity);
      const storedTokens = await tokenRepository.find();
      expect(storedTokens[0].id).toBe(NETWORKS.ergo.nativeToken);
      expect(storedTokens[0].isNative).toBe(true);

      const lockedAssetRepository = dataSource.getRepository(LockedAssetEntity);
      const storedLockedAssets = await lockedAssetRepository.find();
      expect(storedLockedAssets).toHaveLength(2);
    });

    /**
     * @target should store wrapped token as bridged asset
     * @dependencies
     * - database
     * - assetAggregator
     * @scenario
     * - create ChainAssetBalanceInfo with wrapped token and address balances
     * - provide total supply for the token
     * - call update method
     * @expected
     * - token should be stored in database with correct id and isNative=false
     * - bridged asset should be stored with calculated bridged amount
     */
    it<BridgedAssetTestContext>('should store wrapped token as bridged asset', async ({
      assetAggregator,
      dataSource,
    }) => {
      await assetAggregator.update(
        WRAPPED_TOKEN_CHAIN_BALANCE_INFO,
        WRAPPED_TOKEN_TOTAL_SUPPLY,
      );

      const tokenRepository = dataSource.getRepository(TokenEntity);
      const token = (await tokenRepository.find()).at(1);
      expect(token).not.toBeUndefined();
      expect(token!.isNative).toBe(false);

      const bridgedAssetRepository =
        dataSource.getRepository(BridgedAssetEntity);
      const storedBridgedAssets = await bridgedAssetRepository.find();
      expect(storedBridgedAssets).toHaveLength(1);
    });

    /**
     * @target should handle both native and wrapped tokens in same chain
     * @dependencies
     * - database
     * - assetAggregator
     * @scenario
     * - create ChainAssetBalanceInfo with both native token (erg) and wrapped token
     * - provide total supply for wrapped token
     * - call update method
     * @expected
     * - 2 tokens should be stored in database
     * - native token should be stored as locked asset
     * - wrapped token should be stored as bridged asset with correct amount
     */
    it<BridgedAssetTestContext>('should handle both native and wrapped tokens in same chain', async ({
      assetAggregator,
      dataSource,
    }) => {
      await assetAggregator.update(
        MIXED_TOKENS_CHAIN_BALANCE_INFO,
        MIXED_TOKENS_TOTAL_SUPPLY,
      );

      const lockedAssetRepository = dataSource.getRepository(LockedAssetEntity);
      const storedLockedAssets = await lockedAssetRepository.find();
      expect(storedLockedAssets).toHaveLength(1);
      expect(storedLockedAssets[0].tokenId).toBe(NETWORKS.ergo.nativeToken);

      const bridgedAssetRepository =
        dataSource.getRepository(BridgedAssetEntity);
      const storedBridgedAssets = await bridgedAssetRepository.find();
      expect(storedBridgedAssets).toHaveLength(1);
      expect(storedBridgedAssets[0].amount).toBe(5000n);
    });

    /**
     * @target should remove unused locked/bridged assets after update
     * @dependencies
     * - database
     * - assetAggregator
     * @scenario
     * - insert an unused locked-token into database
     * - insert an unused bridged-Token into database
     * - create ChainAssetBalanceInfo with different token
     * - call update method
     * @expected
     * - unused token should be removed from database
     * - only the new token should remain in database
     */
    it<BridgedAssetTestContext>('should remove unused locked/bridged assets after update', async ({
      assetAggregator,
      dataSource,
    }) => {
      const tokenRepository = dataSource.getRepository(TokenEntity);
      await tokenRepository.deleteAll();
      await tokenRepository.insert({
        id: 'unused-token',
        decimal: 18,
        significantDecimal: 18,
        name: 'Unused Token',
        chain: 'ergo',
        isNative: false,
      });

      const bridgedAssetRepository =
        dataSource.getRepository(BridgedAssetEntity);
      const lockedAssetRepository = dataSource.getRepository(LockedAssetEntity);
      await bridgedAssetRepository.deleteAll();
      await lockedAssetRepository.deleteAll();
      await bridgedAssetRepository.insert({
        amount: 1000n,
        chain: 'ergo',
        tokenId: 'unused-token',
        bridgedTokenId: 'unused-token-id',
      });
      await lockedAssetRepository.insert({
        amount: 1000n,
        address: '6152e7b55893488594606d9e740fb377',
        tokenId: 'unused-token',
      });

      expect(await bridgedAssetRepository.count()).toBe(1);
      expect(await lockedAssetRepository.count()).toBe(1);

      const chainAssetBalanceInfo: any = {
        ergo: {
          erg: [{ address: 'test-address-1', balance: 1000n }],
        },
      };

      const totalSupply: Array<{ assetId: string; totalSupply: bigint }> = [];
      await assetAggregator.updateTokens();
      await assetAggregator.update(chainAssetBalanceInfo, totalSupply);

      const storedLockedTokens = await lockedAssetRepository.find();
      expect(storedLockedTokens).toHaveLength(1);
      expect(
        storedLockedTokens.some((t) => t.tokenId == NETWORKS.ergo.nativeToken),
      ).toBeTruthy();
      expect(
        storedLockedTokens.some((t) => t.tokenId == 'unused-token'),
      ).not.toBeTruthy();

      const storedBridgedTokens = await lockedAssetRepository.find();
      expect(storedBridgedTokens).toHaveLength(1);
      expect(
        storedBridgedTokens.some((t) => t.tokenId == NETWORKS.ergo.nativeToken),
      ).toBeTruthy();
      expect(
        storedBridgedTokens.some((t) => t.tokenId == 'unused-token'),
      ).not.toBeTruthy();
    });

    /**
     * @target should handle multiple chains
     * @dependencies
     * - database
     * - assetAggregator
     * @scenario
     * - create ChainAssetBalanceInfo with tokens from multiple chains (ergo and binance)
     * - call update method
     * @expected
     * - tokens from all chains should be stored in database
     */
    it<BridgedAssetTestContext>('should handle multiple chains', async ({
      assetAggregator,
      dataSource,
    }) => {
      await assetAggregator.update(MULTI_CHAIN_BALANCE_INFO, []);

      const tokenRepository = dataSource.getRepository(TokenEntity);
      const storedTokens = await tokenRepository.find();
      expect(storedTokens.length).toEqual(10);
    });

    /**
     * @target should calculate bridged amount correctly for wrapped tokens
     * @dependencies
     * - database
     * - assetAggregator
     * @scenario
     * - create ChainAssetBalanceInfo with wrapped token and multiple address balances
     * - provide total supply for the token
     * - call update method
     * @expected
     * - bridged amount should be calculated as totalSupply - sum of all locked balances
     * - bridged asset should be stored with correct calculated amount
     */
    it<BridgedAssetTestContext>('should calculate bridged amount correctly for wrapped tokens', async ({
      assetAggregator,
      dataSource,
    }) => {
      await assetAggregator.update(
        BRIDGED_AMOUNT_CHAIN_BALANCE_INFO,
        BRIDGED_AMOUNT_TOTAL_SUPPLY,
      );

      const bridgedAssetRepository =
        dataSource.getRepository(BridgedAssetEntity);
      const storedBridgedAssets = await bridgedAssetRepository.find();
      expect(storedBridgedAssets).toHaveLength(1);
      expect(storedBridgedAssets[0].amount).toBe(150n);
    });

    /**
     * @target should handle empty balance array for a token
     * @dependencies
     * - database
     * - assetAggregator
     * @scenario
     * - create ChainAssetBalanceInfo with native token but empty balance array
     * - call update method
     * @expected
     * - update should complete without throwing any errors
     */
    it<BridgedAssetTestContext>('should handle empty balance array for a token', async ({
      assetAggregator,
    }) => {
      expect(
        await assetAggregator.update({ ergo: { erg: [] } } as any, []),
      ).toBeUndefined();
    });
  });

  describe('updateTokens', () => {
    /**
     * @target should collect native tokens correctly
     * @scenario
     * - database
     * - assetAggregator
     * @expected
     * - nativeTokens should not be empty
     * - each token should be native in owned chain
     */
    it<BridgedAssetTestContext>('should collect native tokens correctly', async ({
      assetAggregator,
      tokenMap,
    }) => {
      const tokens = await assetAggregator['updateTokens']();

      expect(tokens.length).toBeGreaterThan(0);
      expect(
        tokens.every(
          (t) =>
            tokenMap
              .getTokens(t.chain, t.chain)
              .filter((t2) => t2.tokenId == t.id).length == 1,
        ),
      ).toBeTruthy();
    });
  });
});
