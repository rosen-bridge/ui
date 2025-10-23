import {
  DataSource,
  QueryRunner,
  Repository,
} from '@rosen-bridge/extended-typeorm';
import { describe, beforeEach, it, expect } from 'vitest';

import { LockedAssetEntity } from '../../lib';
import { LockedAssetAction } from '../../lib/actions';
import { createDatabase } from '../testUtils';
import { LockedAssetMockData } from './mocked/lockedAssetAction.mock';

interface LockedAssetTestContext {
  dataSource: DataSource;
  queryRunner: QueryRunner;
  repository: Repository<LockedAssetEntity>;
  action: LockedAssetAction;
}

describe('LockedAssetAction', () => {
  beforeEach<LockedAssetTestContext>(async (context) => {
    context.dataSource = await createDatabase();
    context.queryRunner = context.dataSource.createQueryRunner();
    context.repository =
      context.queryRunner.manager.getRepository(LockedAssetEntity);
    context.action = new LockedAssetAction(context.dataSource);
  });

  describe('store', () => {
    /**
     * @target should store a single locked asset
     * @dependencies
     * @scenario
     * - call the store function
     * @expected
     * - New record of LockedAssetEntity should stored in database
     */
    it<LockedAssetTestContext>('should store a single locked asset', async ({
      action,
      repository,
    }) => {
      const asset = LockedAssetMockData.createSingleAsset();
      await action.store(asset);
      const stored = await repository.find();
      expect(stored).toHaveLength(1);
    });

    /**
     * @target should store multiple locked assets
     * @dependencies
     * @scenario
     * - call the store function by array of assets data
     * @expected
     * - Two new records of LockedAssetEntity should stored in database
     */
    it<LockedAssetTestContext>('should store multiple locked assets', async ({
      action,
      repository,
    }) => {
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
     * @scenario
     * - insert two LockedAssetEntity to database
     * - call the getAll function
     * @expected
     * - Two records of LockedAssetEntity should returned
     */
    it<LockedAssetTestContext>('should return all locked assets with address and tokenId', async ({
      action,
      repository,
    }) => {
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
     * @scenario
     * - insert a LockedAssetEntity to database
     * - call the remove function
     * @expected
     * - Record of LockedAssetEntity should removed from database
     */
    it<LockedAssetTestContext>('should remove a single locked asset', async ({
      action,
      repository,
    }) => {
      const asset = LockedAssetMockData.createSingleAsset();
      await repository.save(asset);
      await action.remove(LockedAssetMockData.SAMPLE_REMOVE_DATA[0]);
      const remaining = await repository.find();
      expect(remaining).toHaveLength(0);
    });

    /**
     * @target should remove multiple locked assets
     * @dependencies
     * @scenario
     * - insert two LockedAssetEntities to database
     * - call the remove function by multiple LockedAssetEntities data
     * @expected
     * - Record of LockedAssetEntities should removed from database
     */
    it<LockedAssetTestContext>('should remove multiple locked assets', async ({
      action,
      repository,
    }) => {
      const assets = LockedAssetMockData.createMultipleAssets(2);
      await repository.save(assets);
      await action.remove(LockedAssetMockData.SAMPLE_REMOVE_DATA);
      const remaining = await repository.find();
      expect(remaining).toHaveLength(0);
    });

    /**
     * @target should handle removal of non-existent locked assets gracefully
     * @dependencies
     * @scenario
     * - insert a LockedAssetEntity to database
     * - call the remove function by non-existing LockedAssetEntities data
     * @expected
     * - Record of LockedAssetEntities should remain intact
     */
    it<LockedAssetTestContext>('should handle removal of non-existent locked assets gracefully', async ({
      action,
      repository,
    }) => {
      const asset = LockedAssetMockData.createSingleAsset();
      await repository.save(asset);
      await action.remove(LockedAssetMockData.SAMPLE_REMOVE_DATA[1]);
      const remaining = await repository.find();
      expect(remaining).toHaveLength(1);
    });
  });
});
