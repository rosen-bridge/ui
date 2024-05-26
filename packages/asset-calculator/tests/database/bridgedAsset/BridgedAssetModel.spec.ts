import { beforeEach, describe, it } from '@vitest/runner';
import { expect } from 'vitest';

import {
  allAssetRecords,
  initDatabase,
  insertAssetRecords,
} from './BridgedAssetModel.mock';
import { bridgedAssets } from '../test-data';
import { BridgedAssetModel } from '../../../lib/database/bridgedAsset/BridgedAssetModel';

describe('BridgedAssetModel', () => {
  let assetModel: BridgedAssetModel;
  beforeEach(async () => {
    const dataSource = await initDatabase();
    assetModel = new BridgedAssetModel(dataSource);
  });

  describe('getAllStoredAssets', () => {
    /**
     * @target getAllStoredAssets should return all assets stored in database
     * @dependencies
     * - database
     * @scenario
     * - insert mocked assets
     * - run test (call `getAllStoredAssets`)
     * @expected
     * - return two stored assets
     */
    it('should return all assets stored in database', async () => {
      await insertAssetRecords(bridgedAssets);
      const savedAssets = await assetModel.getAllStoredAssets();
      expect(savedAssets.length).toEqual(2);
      expect(savedAssets).toEqual([
        { chain: bridgedAssets[0].chain, tokenId: bridgedAssets[0].tokenId },
        { chain: bridgedAssets[1].chain, tokenId: bridgedAssets[1].tokenId },
      ]);
    });
  });

  describe('removeAssets', () => {
    /**
     * @target removeUnusedAssets should remove assets with specified chain and
     * tokenId
     * @dependencies
     * - database
     * @scenario
     * - insert mocked assets
     * - run test (call `removeUnusedAssets`)
     * - check database
     * @expected
     * - exist only one asset
     */
    it('should remove assets with specified chain and tokenId', async () => {
      await insertAssetRecords(bridgedAssets);
      await assetModel.removeAssets([
        { chain: bridgedAssets[1].chain, tokenId: bridgedAssets[1].tokenId },
      ]);
      const savedAssets = await allAssetRecords();
      expect(savedAssets.length).toEqual(1);
      expect(savedAssets[0]).toEqual(bridgedAssets[0]);
    });
  });
});
