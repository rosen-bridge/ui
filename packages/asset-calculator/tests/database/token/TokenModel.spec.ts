import { beforeEach, describe, it } from '@vitest/runner';
import { expect } from 'vitest';

import {
  allTokenRecords,
  initDatabase,
  insertTokenRecords,
} from './TokenModel.mock';
import { tokens } from '../test-data';
import { TokenModel } from '../../../lib/database/token/TokenModel';

describe('TokenModel', () => {
  let tokenModel: TokenModel;
  beforeEach(async () => {
    const dataSource = await initDatabase();
    tokenModel = new TokenModel(dataSource);
  });

  describe('insertToken', () => {
    /**
     * @target insertToken should insert token when there is no stored token
     * with this id
     * @dependencies
     * - database
     * @scenario
     * - run test with mocked token (call `insertToken`)
     * - check database
     * @expected
     * - token should be inserted into db
     */
    it('should insert token when there is no stored token with this id', async () => {
      await tokenModel.insertToken(tokens[0]);
      const savedTokens = await allTokenRecords();
      expect(savedTokens.length).toEqual(1);
      expect(tokens[0]).toEqual(tokens[0]);
    });
  });

  describe('getAllStoredTokens', () => {
    /**
     * @target getAllStoredTokens should return all token ids stored in database
     * @dependencies
     * - database
     * @scenario
     * - insert mocked tokens
     * - run test (call `getAllStoredTokens`)
     * @expected
     * - return two stored token ids
     */
    it('should return all token ids stored in database', async () => {
      await insertTokenRecords(tokens);
      const savedTokens = await tokenModel.getAllStoredTokens();
      expect(savedTokens.length).toEqual(2);
      expect(savedTokens.sort()).toEqual([tokens[0].id, tokens[1].id].sort());
    });
  });

  describe('removeTokens', () => {
    /**
     * @target removeTokens should remove tokens with specified id
     * @dependencies
     * - database
     * @scenario
     * - insert mocked tokens
     * - run test (call `removeTokens`)
     * - check database
     * @expected
     * - exist only one token
     */
    it('should remove tokens with specified id', async () => {
      await insertTokenRecords(tokens);
      await tokenModel.removeTokens([tokens[1].id]);
      const savedTokens = await allTokenRecords();
      expect(savedTokens.length).toEqual(1);
      expect(savedTokens[0]).toEqual(tokens[0]);
    });
  });
});
