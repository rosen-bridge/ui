import {
  DataSource,
  QueryRunner,
  Repository,
} from '@rosen-bridge/extended-typeorm';
import { describe, beforeEach, it, expect } from 'vitest';

import { TokenEntity } from '../../lib';
import { TokenAction } from '../../lib/actions';
import { createDatabase } from '../testUtils';
import { TokenMockData } from './mocked/tokenAction.mock';

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

  describe('insert', () => {
    /**
     * @target should insert a single token
     * @dependencies
     * @scenario
     * - call the insert function
     * @expected
     * - New record of TokenEntity should stored in database
     */
    it<TokenTestContext>('should insert a single token', async ({
      action,
      repository,
    }) => {
      const token = TokenMockData.createSingleToken();
      await action.insert(token);
      const stored = await repository.find();
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe('tkn-1');
    });

    /**
     * @target should insert multiple tokens
     * @dependencies
     * @scenario
     * - call the insert function by array of tokens
     * @expected
     * - Two new records of TokenEntity should stored in database
     */
    it<TokenTestContext>('should insert multiple tokens', async ({
      action,
      repository,
    }) => {
      const tokens = TokenMockData.createMultipleTokens(2);
      await action.insert(tokens);
      const stored = await repository.find();
      expect(stored).toHaveLength(2);
    });
  });

  describe('getAll', () => {
    /**
     * @target should return all tokens with id
     * @dependencies
     * @scenario
     * - insert two TokenEntity to database
     * - call the getAll function
     * @expected
     * - Two records of TokenEntity should returned
     */
    it<TokenTestContext>('should return all tokens with id', async ({
      action,
      repository,
    }) => {
      const tokens = TokenMockData.createMultipleTokens(2);
      await repository.save(tokens);
      const result = await action.getAll();
      expect(result).toHaveLength(2);
    });

    /**
     * @target should return empty array when no tokens exist
     * @dependencies
     * @scenario
     * - call the getAll function without inserting any data
     * @expected
     * - Empty array should be returned
     */
    it<TokenTestContext>('should return empty array when no tokens exist', async ({
      action,
    }) => {
      const result = await action.getAll();
      expect(result).toEqual([]);
    });
  });

  describe('remove', () => {
    /**
     * @target should remove a single token
     * @dependencies
     * @scenario
     * - insert a TokenEntity to database
     * - call the remove function
     * @expected
     * - Record of TokenEntity should removed from database
     */
    it<TokenTestContext>('should remove a single token', async ({
      action,
      repository,
    }) => {
      const token = TokenMockData.createSingleToken();
      await repository.save(token);
      await action.remove('tkn-1');
      const remaining = await repository.find();
      expect(remaining).toHaveLength(0);
    });

    /**
     * @target should remove multiple tokens
     * @dependencies
     * @scenario
     * - insert two TokenEntities to database
     * - call the remove function by list of token ids
     * @expected
     * - Records of TokenEntities should removed from database
     */
    it<TokenTestContext>('should remove multiple tokens', async ({
      action,
      repository,
    }) => {
      const tokens = TokenMockData.createMultipleTokens(2);
      await repository.save(tokens);
      await action.remove(TokenMockData.SAMPLE_REMOVE_IDS);
      const remaining = await repository.find();
      expect(remaining).toHaveLength(0);
    });
  });
});
