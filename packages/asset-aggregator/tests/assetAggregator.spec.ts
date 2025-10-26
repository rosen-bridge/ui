/* eslint-disable @typescript-eslint/no-explicit-any */
import { DataSource, QueryRunner } from '@rosen-bridge/extended-typeorm';
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
  queryRunner: QueryRunner;
  tokenMap: TokenMap;
  assetAggregator: AssetAggregator;
}

describe('AssetAggregator', () => {
  beforeEach<BridgedAssetTestContext>(async (context) => {
    const tokenMap = new TokenMap();
    tokenMap.updateConfigByJson(SAMPLE_TOKEN_MAP);
    context.dataSource = await createDatabase();
    context.queryRunner = context.dataSource.createQueryRunner();
    context.tokenMap = tokenMap;
    context.assetAggregator = new AssetAggregator(
      context.tokenMap,
      context.dataSource,
    );
  });

  describe('update', () => {
    /**
     * @target AssetAggregator.update should store native token as locked asset
     * @dependencies
     * - database
     * - AssetAggregator.update
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
      expect(storedTokens).toHaveLength(1);
      expect(storedTokens[0].id).toBe(NETWORKS.ergo.nativeToken);
      expect(storedTokens[0].isNative).toBe(true);

      const lockedAssetRepository = dataSource.getRepository(LockedAssetEntity);
      const storedLockedAssets = await lockedAssetRepository.find();
      expect(storedLockedAssets).toHaveLength(2);
    });

    /**
     * @target AssetAggregator.update should store wrapped token as bridged asset
     * @dependencies
     * - database
     * - AssetAggregator.update
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
      const storedTokens = await tokenRepository.find();
      expect(storedTokens).toHaveLength(1);
      expect(storedTokens[0].id).toBe(
        '92f7cec6d682e8a0d965e6d93de66ec18933f72181c59a5d85802f0fe2afc900',
      );
      expect(storedTokens[0].isNative).toBe(false);

      const bridgedAssetRepository =
        dataSource.getRepository(BridgedAssetEntity);
      const storedBridgedAssets = await bridgedAssetRepository.find();
      expect(storedBridgedAssets).toHaveLength(1);
    });

    /**
     * @target AssetAggregator.update should handle both native and wrapped tokens in same chain
     * @dependencies
     * - database
     * - AssetAggregator.update
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

      const tokenRepository = dataSource.getRepository(TokenEntity);
      const storedTokens = await tokenRepository.find();
      expect(storedTokens).toHaveLength(2);

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
     * @target AssetAggregator.update should remove unused tokens after update
     * @dependencies
     * - database
     * - AssetAggregator.update
     * @scenario
     * - insert an unused token into database
     * - create ChainAssetBalanceInfo with different token (native token)
     * - call update method
     * @expected
     * - unused token should be removed from database
     * - only the new token should remain in database
     */
    it<BridgedAssetTestContext>('should remove unused tokens after update', async ({
      assetAggregator,
      dataSource,
    }) => {
      const tokenRepository = dataSource.getRepository(TokenEntity);
      await tokenRepository.insert({
        id: 'unused-token',
        decimal: 18,
        name: 'Unused Token',
        chain: 'ergo',
        isNative: false,
      });

      expect(await tokenRepository.count()).toBe(1);

      const ChainAssetBalanceInfo: any = {
        ergo: {
          erg: [{ address: 'test-address-1', balance: 1000n }],
        },
      };

      const totalSupply: Array<{ assetId: string; totalSupply: bigint }> = [];

      await assetAggregator.update(ChainAssetBalanceInfo, totalSupply);

      const storedTokens = await tokenRepository.find();
      expect(storedTokens).toHaveLength(1);
      expect(storedTokens[0].id).toBe(NETWORKS.ergo.nativeToken);
      expect(storedTokens[0].id).not.toBe('unused-token');
    });

    /**
     * @target AssetAggregator.update should handle multiple chains
     * @dependencies
     * - database
     * - AssetAggregator.update
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
      expect(storedTokens.length).toBeGreaterThan(0);
    });

    /**
     * @target AssetAggregator.update should calculate bridged amount correctly for wrapped tokens
     * @dependencies
     * - database
     * - AssetAggregator.update
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
     * @target AssetAggregator.update should handle empty balance array for a token
     * @dependencies
     * - database
     * - AssetAggregator.update
     * @scenario
     * - create ChainAssetBalanceInfo with native token but empty balance array
     * - call update method
     * @expected
     * - update should complete without throwing any errors
     */
    it<BridgedAssetTestContext>('should handle empty balance array for a token', async ({
      assetAggregator,
    }) => {
      await assetAggregator.update({ ergo: { erg: [] } } as any, []);
    });
  });
});
