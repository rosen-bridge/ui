import {
  DataSource,
  QueryRunner,
  Repository,
} from '@rosen-bridge/extended-typeorm';
import { describe, beforeEach, it, expect } from 'vitest';

import { TokenEntity } from '../../lib';
import { TokenAction } from '../../lib/actions';
import { TokenMockData } from '../mocked/actions/tokenAction.mock';
import { createDatabase } from '../testUtils';

interface TokenTestContext {
  dataSource: DataSource;
  queryRunner: QueryRunner;
  repository: Repository<TokenEntity>;
  action: TokenAction;
}

describe('TokenAction', () => {
  beforeEach<TokenTestContext>(async (context) => {
    context.dataSource = await createDatabase();
    context.queryRunner = context.dataSource.createQueryRunner();
    context.repository = context.queryRunner.manager.getRepository(TokenEntity);
    context.action = new TokenAction(context.dataSource);
  });

  describe('store', () => {
    /**
     * @target should store a single token
     * @dependencies
     * @scenario
     * - call the store function
     * @expected
     * - New record of TokenEntity should stored in database
     */
    it<TokenTestContext>('should store a single token', async ({
      action,
      repository,
    }) => {
      const token = TokenMockData.createSingleToken();
      await action.store(token);
      const stored = await repository.find();
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe('tkn-1');
    });

    /**
     * @target should store multiple tokens
     * @dependencies
     * @scenario
     * - call the store function by array of tokens
     * @expected
     * - Two new records of TokenEntity should stored in database
     */
    it<TokenTestContext>('should store multiple tokens', async ({
      action,
      repository,
    }) => {
      const tokens = TokenMockData.createMultipleTokens(2);
      await action.store(tokens);
      const stored = await repository.find();
      expect(stored).toHaveLength(2);
    });
  });
});
