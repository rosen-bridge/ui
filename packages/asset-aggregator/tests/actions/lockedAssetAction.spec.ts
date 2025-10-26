import {
  DataSource,
  QueryRunner,
  Repository,
} from '@rosen-bridge/extended-typeorm';
import { describe, beforeEach, it, expect } from 'vitest';

import { LockedAssetEntity, TokenEntity } from '../../lib';
import { LockedAssetAction } from '../../lib/actions';
import { LockedAssetMockData } from '../mocked/actions/lockedAssetAction.mock';
import { createDatabase } from '../testUtils';

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
      await tokenRepository.insert(LockedAssetMockData.SAMPLE_TOKENS[0]);

      const asset = LockedAssetMockData.createSingleAsset();
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
        LockedAssetMockData.SAMPLE_TOKENS[0],
        LockedAssetMockData.SAMPLE_TOKENS[1],
      ]);

      const assets = LockedAssetMockData.createMultipleAssets(2);
      await action.store(assets);
      const stored = await repository.find();
      expect(stored).toHaveLength(2);
    });
  });

  describe('getAll', () => {
    /**
     * @target should return all locked assets with address and tokenId
     * @dependencies
     * - TokenEntity (for foreign key constraint)
     * @scenario
     * - insert required token entities first
     * - insert test LockedAssetEntity records
     * - call the getAll function
     * @expected
     * - All LockedAssetEntity records should be returned
     */
    it<LockedAssetTestContext>('should return all locked assets with address and tokenId', async ({
      action,
      repository,
      tokenRepository,
    }) => {
      // Insert required tokens first
      await tokenRepository.insert([
        LockedAssetMockData.SAMPLE_TOKENS[0],
        LockedAssetMockData.SAMPLE_TOKENS[1],
      ]);

      const assets = LockedAssetMockData.createMultipleAssets(2);
      await repository.save(assets);
      const result = await action.getAll();
      expect(result).toHaveLength(2);
    });
  });

  describe('remove', () => {
    /**
     * @target should remove a single locked asset
     * @dependencies
     * - TokenEntity (for foreign key constraint)
     * @scenario
     * - insert required token entity first
     * - insert test LockedAssetEntity record
     * - call the remove function
     * @expected
     * - LockedAssetEntity record should be removed from database
     */
    it<LockedAssetTestContext>('should remove a single locked asset', async ({
      action,
      repository,
      tokenRepository,
    }) => {
      // Insert required token first
      await tokenRepository.insert(LockedAssetMockData.SAMPLE_TOKENS[0]);

      const asset = LockedAssetMockData.createSingleAsset();
      await repository.save(asset);
      await action.remove(LockedAssetMockData.SAMPLE_REMOVE_DATA[0]);
      const remaining = await repository.find();
      expect(remaining).toHaveLength(0);
    });

    /**
     * @target should remove multiple locked assets
     * @dependencies
     * - TokenEntity (for foreign key constraint)
     * @scenario
     * - insert required token entities first
     * - insert test LockedAssetEntity records
     * - call the remove function with multiple records
     * @expected
     * - Multiple LockedAssetEntity records should be removed from database
     */
    it<LockedAssetTestContext>('should remove multiple locked assets', async ({
      action,
      repository,
      tokenRepository,
    }) => {
      // Insert required tokens first
      await tokenRepository.insert([
        LockedAssetMockData.SAMPLE_TOKENS[0],
        LockedAssetMockData.SAMPLE_TOKENS[1],
      ]);

      const assets = LockedAssetMockData.createMultipleAssets(2);
      await repository.save(assets);
      await action.remove(LockedAssetMockData.SAMPLE_REMOVE_DATA);
      const remaining = await repository.find();
      expect(remaining).toHaveLength(0);
    });

    /**
     * @target should handle removal of non-existent locked assets gracefully
     * @dependencies
     * - TokenEntity (for foreign key constraint)
     * @scenario
     * - insert required token entity first
     * - insert test LockedAssetEntity record
     * - call the remove function with non-existing data
     * @expected
     * - Existing LockedAssetEntity record should remain intact
     */
    it<LockedAssetTestContext>('should handle removal of non-existent locked assets gracefully', async ({
      action,
      repository,
      tokenRepository,
    }) => {
      // Insert required token first
      await tokenRepository.insert(LockedAssetMockData.SAMPLE_TOKENS[0]);

      const asset = LockedAssetMockData.createSingleAsset();
      await repository.save(asset);
      await action.remove(LockedAssetMockData.SAMPLE_REMOVE_DATA[1]);
      const remaining = await repository.find();
      expect(remaining).toHaveLength(1);
    });
  });
});
