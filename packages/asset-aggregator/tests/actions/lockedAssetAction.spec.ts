import {
  DataSource,
  QueryRunner,
  Repository,
} from '@rosen-bridge/extended-typeorm';
import { describe, beforeEach, it, expect } from 'vitest';

import { LockedAssetEntity, TokenEntity } from '../../lib';
import { LockedAssetAction } from '../../lib/actions';
import { createDatabase } from '../testUtils';
import { LockedAssetTestData } from './lockedAssetActionTestData';

interface LockedAssetTestContext {
  dataSource: DataSource;
  queryRunner: QueryRunner;
  repository: Repository<LockedAssetEntity>;
  tokenRepository: Repository<TokenEntity>;
  action: LockedAssetAction;
}

describe('LockedAssetAction', () => {
  beforeEach<LockedAssetTestContext>(async (context) => {
    context.dataSource = await createDatabase();
    context.queryRunner = context.dataSource.createQueryRunner();
    context.repository =
      context.queryRunner.manager.getRepository(LockedAssetEntity);
    context.tokenRepository =
      context.queryRunner.manager.getRepository(TokenEntity);
    context.action = new LockedAssetAction(context.dataSource);
  });

  describe('store', () => {
    /**
     * @target should store a single locked asset
     * @dependencies
     * - TokenEntity (for foreign key constraint)
     * @scenario
     * - insert required token entity first
     * - call the store function with LockedAssetEntity
     * @expected
     * - New record of LockedAssetEntity should be stored in database
     */
    it<LockedAssetTestContext>('should store a single locked asset', async ({
      action,
      repository,
      tokenRepository,
    }) => {
      // Insert required token first
      await tokenRepository.insert(LockedAssetTestData.SAMPLE_TOKENS[0]);

      const asset = LockedAssetTestData.createSingleAsset();
      await action.store(asset);
      const stored = await repository.find();
      expect(stored).toHaveLength(1);
    });

    /**
     * @target should store multiple locked assets
     * @dependencies
     * - TokenEntity (for foreign key constraint)
     * @scenario
     * - insert required token entities first
     * - call the store function with array of LockedAssetEntity
     * @expected
     * - Multiple records of LockedAssetEntity should be stored in database
     */
    it<LockedAssetTestContext>('should store multiple locked assets', async ({
      action,
      repository,
      tokenRepository,
    }) => {
      // Insert required tokens first
      await tokenRepository.insert([
        LockedAssetTestData.SAMPLE_TOKENS[0],
        LockedAssetTestData.SAMPLE_TOKENS[1],
      ]);

      const assets = LockedAssetTestData.createMultipleAssets(2);
      await action.store(assets);
      const stored = await repository.find();
      expect(stored).toHaveLength(2);
    });
  });

  describe('keepOnly', () => {
    /**
     * @target should persist a single locked-token and remove other tokens
     * @dependencies
     * @scenario
     * - store multiple LockedAssetEntities to database
     * - call the keepOnly function
     * @expected
     * - All other records of TokenEntity should removed from database
     */
    it<LockedAssetTestContext>('should persist a single locked-token and remove other tokens', async ({
      action,
      tokenRepository,
      repository,
    }) => {
      await tokenRepository.insert(LockedAssetTestData.SAMPLE_TOKENS);
      const tokens = await tokenRepository.find();
      const lockedEntities =
        LockedAssetTestData.generateTestDataLockedEntity(tokens);
      await repository.insert(lockedEntities);
      let remaining = await repository.find();
      await action.keepOnly(remaining[0].tokenId);
      const dbRemaining = await repository.find();
      expect(dbRemaining).toHaveLength(1);
      expect(dbRemaining[0]).toEqual(remaining[0]);
    });
  });
});
