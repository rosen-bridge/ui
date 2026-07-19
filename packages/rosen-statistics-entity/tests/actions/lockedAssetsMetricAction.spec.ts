import {
  type AbstractLogger,
  DummyLogger,
} from '@rosen-bridge/abstract-logger';
import type { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
import { LockedAssetEntity, TokenEntity } from '@rosen-ui/asset-calculator';

import { beforeEach, describe, expect, it } from 'vitest';

import { LockedAssetsMetricAction } from '../../lib';
import { lockedAssetsMetricActionTestData } from '../testData';
import { createDatabase } from '../utils';

describe('LockedAssetsMetricAction', () => {
  let dataSource: DataSource;
  let lockedAssetRepo: Repository<LockedAssetEntity>;
  let tokenRepo: Repository<TokenEntity>;
  let logger: AbstractLogger;
  let action: LockedAssetsMetricAction;

  beforeEach(async () => {
    dataSource = await createDatabase();
    lockedAssetRepo = dataSource.getRepository(LockedAssetEntity);
    tokenRepo = dataSource.getRepository(TokenEntity);
    logger = new DummyLogger();

    await lockedAssetRepo.clear();
    await tokenRepo.clear();

    action = new LockedAssetsMetricAction(dataSource, logger);
  });

  describe('getLockedAssets', () => {
    /**
     * @target getLockedAssets should return empty array when no locked assets exist
     * @dependencies
     * - database
     * @scenario
     * - No records in LockedAssetEntity table
     * - Call getLockedAssets
     * @expected
     * - Returns empty array
     */
    it('should return empty array when no locked assets exist', async () => {
      const result = await action.getLockedAssets();

      expect(result).toHaveLength(0);
    });

    /**
     * @target getLockedAssets should return correct locked assets ttokenIds, amounts, and significantDecimals
     * @dependenciesq
     * - database
     * @scenario
     * - Insert multiple TokenEntity records with different significantDecimals
     * - Insert multiple LockedAssetEntity records for each token
     * - Call getLockedAssets
     * @expected
     * - Returns array with correct tokenIds, amounts, and significantDecimals from TokenEntity
     */
    it('should return correct locked assets tokenIds, amounts, and significantDecimals', async () => {
      const testData =
        lockedAssetsMetricActionTestData.getLockedAssetsMultipleTokens;

      await tokenRepo.insert(testData.tokens);
      await lockedAssetRepo.insert(testData.lockedAssets);

      const result = await action.getLockedAssets();

      expect(result).toHaveLength(testData.expectedResults.length);
      expect(result).toEqual(testData.expectedResults);
    });
  });
});
