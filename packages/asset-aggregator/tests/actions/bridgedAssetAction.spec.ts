import {
  DataSource,
  QueryRunner,
  Repository,
} from '@rosen-bridge/extended-typeorm';
import { describe, beforeEach, it, expect } from 'vitest';

import { BridgedAssetEntity } from '../../lib';
import { BridgedAssetAction } from '../../lib/actions';
import { createDatabase } from '../testUtils';
import { BridgedAssetMockData } from './mocked/bridgedAssetAction.mock';

interface BridgedAssetTestContext {
  dataSource: DataSource;
  queryRunner: QueryRunner;
  repository: Repository<BridgedAssetEntity>;
  action: BridgedAssetAction;
}

describe('BridgedAssetAction', () => {
  beforeEach<BridgedAssetTestContext>(async (context) => {
    context.dataSource = await createDatabase();
    context.queryRunner = context.dataSource.createQueryRunner();
    context.repository =
      context.queryRunner.manager.getRepository(BridgedAssetEntity);
    context.action = new BridgedAssetAction(context.dataSource);
  });

  describe('store', () => {
    /**
     * @target should store a single bridged asset
     * @dependencies
     * @scenario
     * - call the store function
     * @expected
     * - New record of BridgedAssetEntity should stored in database
     */
    it<BridgedAssetTestContext>('should store a single bridged asset', async ({
      action,
      repository,
    }) => {
      const asset = BridgedAssetMockData.createSingleAsset();

      await action.store(asset);

      const storedAssets = await repository.find();
      expect(storedAssets).toHaveLength(1);
    });

    /**
     * @target should store multiple bridged assets
     * @dependencies
     * @scenario
     * - call the store function by array of assets data
     * @expected
     * - Two new records of BridgedAssetEntity should stored in database
     */
    it<BridgedAssetTestContext>('should store multiple bridged assets', async ({
      action,
      repository,
    }) => {
      const assets = BridgedAssetMockData.createMultipleAssets(2);

      await action.store(assets);

      const storedAssets = await repository.find();
      expect(storedAssets).toHaveLength(2);
    });
  });

  describe('getAll', () => {
    /**
     * @target should return all bridged assets with tokenId and chain
     * @dependencies
     * @scenario
     * - insert two BridgedAssetEntity to database
     * - call the getAll function
     * @expected
     * - Two records of BridgedAssetEntity should stored in database
     */
    it<BridgedAssetTestContext>('should return all bridged assets with tokenId and chain', async ({
      action,
      repository,
    }) => {
      // Insert test data using mock data
      const assets = BridgedAssetMockData.createMultipleAssets(2);
      await repository.save(assets);

      const result = await action.getAll();

      expect(result).toHaveLength(2);
    });
  });

  describe('remove', () => {
    /**
     * @target should remove a single bridged asset
     * @dependencies
     * @scenario
     * - insert a BridgedAssetEntity to database
     * - call the remove function
     * @expected
     * - Record of BridgedAssetEntity should removed from database
     */
    it<BridgedAssetTestContext>('should remove a single bridged asset', async ({
      action,
      repository,
    }) => {
      // Insert test data using mock data
      const asset = BridgedAssetMockData.createSingleAsset();
      await repository.save(asset);

      await action.remove(BridgedAssetMockData.SAMPLE_REMOVE_DATA[0]);

      const remainingAssets = await repository.find();
      expect(remainingAssets).toHaveLength(0);
    });

    /**
     * @target should remove multiple bridged assets
     * @dependencies
     * @scenario
     * - insert two BridgedAssetEntities to database
     * - call the remove function by multiple BridgedAssetEntities data
     * @expected
     * - Record of BridgedAssetEntities should removed from database
     */
    it<BridgedAssetTestContext>('should remove multiple bridged assets', async ({
      action,
      repository,
    }) => {
      // Insert test data using mock data
      const assets = BridgedAssetMockData.createMultipleAssets(2);
      await repository.save(assets);

      await action.remove(BridgedAssetMockData.SAMPLE_REMOVE_DATA);

      const remainingAssets = await repository.find();
      expect(remainingAssets).toHaveLength(0);
    });
  });
});
