import {
  DataSource,
  QueryRunner,
  Repository,
} from '@rosen-bridge/extended-typeorm';

import { BridgedAssetEntity, TokenEntity } from '../../lib';
import { AbstractAssetAction } from '../../lib/actions/abstractAssetAction';
import { createDatabase } from '../testUtils';
import { AbstractAssetTestData } from './abstractAssetActionTestData';

interface AbstractAssetTestContext {
  dataSource: DataSource;
  queryRunner: QueryRunner;
  repository: Repository<BridgedAssetEntity>;
  tokenRepository: Repository<TokenEntity>;
  action: TestAssetAction;
}

class TestAssetAction extends AbstractAssetAction<BridgedAssetEntity> {
  protected readonly repository: Repository<BridgedAssetEntity>;

  constructor(protected dataSource: DataSource) {
    super(dataSource);
    this.repository = dataSource.getRepository(BridgedAssetEntity);
  }
}

describe('AbstractAssetAction', () => {
  beforeEach<AbstractAssetTestContext>(async (context) => {
    context.dataSource = await createDatabase();
    context.queryRunner = context.dataSource.createQueryRunner();
    context.repository =
      context.queryRunner.manager.getRepository(BridgedAssetEntity);
    context.tokenRepository =
      context.queryRunner.manager.getRepository(TokenEntity);
    context.action = new TestAssetAction(context.dataSource);
  });

  describe('store', () => {
    /**
     * @target should store a single asset
     * @dependencies
     * - TokenEntity (for foreign key constraint)
     * @scenario
     * - insert required token entity first
     * - call the store function with BridgedAssetEntity
     * @expected
     * - New record of BridgedAssetEntity should be stored in database
     */
    it<AbstractAssetTestContext>('should store a single asset', async ({
      action,
      repository,
      tokenRepository,
    }) => {
      // Insert required token first
      await tokenRepository.insert(AbstractAssetTestData.SAMPLE_TOKENS[0]);

      const asset = AbstractAssetTestData.createSingleAsset();

      await action.store(asset);

      const storedAssets = await repository.find();
      expect(storedAssets).toHaveLength(1);
    });

    /**
     * @target should store multiple assets
     * @dependencies
     * - TokenEntity (for foreign key constraint)
     * @scenario
     * - insert required token entities first
     * - call the store function with array of BridgedAssetEntity
     * @expected
     * - Multiple records of BridgedAssetEntity should be stored in database
     */
    it<AbstractAssetTestContext>('should store multiple assets', async ({
      action,
      repository,
      tokenRepository,
    }) => {
      // Insert required tokens first
      await tokenRepository.insert([
        AbstractAssetTestData.SAMPLE_TOKENS[0],
        AbstractAssetTestData.SAMPLE_TOKENS[1],
      ]);

      const assets = AbstractAssetTestData.createMultipleAssets(2);

      await action.store(assets);

      const storedAssets = await repository.find();
      expect(storedAssets).toHaveLength(2);
    });
  });

  describe('keepOnly', () => {
    /**
     * @target should persist a single token and remove other tokens
     * @dependencies
     * @scenario
     * - store multiple BridgedAssetEntities to database
     * - call the keepOnly function
     * @expected
     * - All other records of TokenEntity should removed from database
     */
    it<AbstractAssetTestContext>('should persist a single token and remove other tokens', async ({
      action,
      tokenRepository,
      repository,
    }) => {
      await tokenRepository.insert(AbstractAssetTestData.SAMPLE_TOKENS);
      const tokens = await tokenRepository.find();
      const entities =
        AbstractAssetTestData.generateTestDataBridgedEntity(tokens);
      await repository.insert(entities);
      const remaining = await repository.find();
      await action.keepOnly(remaining[0].tokenId);
      const dbRemaining = await repository.find();
      expect(dbRemaining).toHaveLength(1);
      expect(dbRemaining[0]).toEqual(remaining[0]);
    });
  });
});
