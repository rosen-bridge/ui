import {
  DataSource,
  QueryRunner,
  Repository,
} from '@rosen-bridge/extended-typeorm';

import { BridgedAssetEntity, TokenEntity } from '../../lib';
import { BridgedAssetAction } from '../../lib/actions';
import { createDatabase } from '../testUtils';
import { BridgedAssetTestData } from './bridgedAssetActionTestData';

interface BridgedAssetTestContext {
  dataSource: DataSource;
  queryRunner: QueryRunner;
  repository: Repository<BridgedAssetEntity>;
  tokenRepository: Repository<TokenEntity>;
  action: BridgedAssetAction;
}

describe('BridgedAssetAction', () => {
  beforeEach<BridgedAssetTestContext>(async (context) => {
    context.dataSource = await createDatabase();
    context.queryRunner = context.dataSource.createQueryRunner();
    context.repository =
      context.queryRunner.manager.getRepository(BridgedAssetEntity);
    context.tokenRepository =
      context.queryRunner.manager.getRepository(TokenEntity);
    context.action = new BridgedAssetAction(context.dataSource);
  });

  describe('store', () => {
    /**
     * @target should store a single bridged asset
     * @dependencies
     * - TokenEntity (for foreign key constraint)
     * @scenario
     * - insert required token entity first
     * - call the store function with BridgedAssetEntity
     * @expected
     * - New record of BridgedAssetEntity should be stored in database
     */
    it<BridgedAssetTestContext>('should store a single bridged asset', async ({
      action,
      repository,
      tokenRepository,
    }) => {
      // Insert required token first
      await tokenRepository.insert(BridgedAssetTestData.SAMPLE_TOKENS[0]);

      const asset = BridgedAssetTestData.createSingleAsset();

      await action.store(asset);

      const storedAssets = await repository.find();
      expect(storedAssets).toHaveLength(1);
    });

    /**
     * @target should store multiple bridged assets
     * @dependencies
     * - TokenEntity (for foreign key constraint)
     * @scenario
     * - insert required token entities first
     * - call the store function with array of BridgedAssetEntity
     * @expected
     * - Multiple records of BridgedAssetEntity should be stored in database
     */
    it<BridgedAssetTestContext>('should store multiple bridged assets', async ({
      action,
      repository,
      tokenRepository,
    }) => {
      // Insert required tokens first
      await tokenRepository.insert([
        BridgedAssetTestData.SAMPLE_TOKENS[0],
        BridgedAssetTestData.SAMPLE_TOKENS[1],
      ]);

      const assets = BridgedAssetTestData.createMultipleAssets(2);

      await action.store(assets);

      const storedAssets = await repository.find();
      expect(storedAssets).toHaveLength(2);
    });
  });

  describe('keepOnly', () => {
    /**
     * @target should persist a single bridged-token and remove other tokens
     * @dependencies
     * @scenario
     * - store multiple BridgedAssetEntities to database
     * - call the keepOnly function
     * @expected
     * - All other records of TokenEntity should removed from database
     */
    it<BridgedAssetTestContext>('should persist a single bridged-token and remove other tokens', async ({
      action,
      tokenRepository,
      repository,
    }) => {
      await tokenRepository.insert(BridgedAssetTestData.SAMPLE_TOKENS);
      const tokens = await tokenRepository.find();
      const bridgedEntities =
        BridgedAssetTestData.generateTestDataBridgedEntity(tokens);
      await repository.insert(bridgedEntities);
      const remaining = await repository.find();
      await action.keepOnly(remaining[0].tokenId);
      const dbRemaining = await repository.find();
      expect(dbRemaining).toHaveLength(1);
      expect(dbRemaining[0]).toEqual(remaining[0]);
    });
  });
});
