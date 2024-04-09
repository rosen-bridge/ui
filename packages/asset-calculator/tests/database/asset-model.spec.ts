import { beforeEach, describe, it } from '@vitest/runner';
import { expect } from 'vitest';

import {
  allAssetRecords,
  initDatabase,
  insertAssetRecords,
} from './asset-model.mock';
import { assets } from './test-data.mock';
import { AssetModel } from '../../lib/database/asset-model';

describe('AssetModel', () => {
  let assetModel: AssetModel;
  beforeEach(async () => {
    const dataSource = await initDatabase();
    assetModel = new AssetModel(dataSource);
  });

  describe('updateAsset', () => {
    /**
     * @target updateAsset should insert asset when there is no stored asset with this id
     * @dependencies
     * - database
     * @scenario
     * - run test with mocked asset (call `updateAsset`)
     * - check database
     * @expected
     * - asset should be inserted into db
     */
    it('should insert asset when there is no stored asset with this id', async () => {
      await assetModel.updateAsset(assets[0]);
      const savedAssets = await allAssetRecords();
      expect(savedAssets.length).to.equal(1);
      expect(savedAssets[0]).to.deep.equal(assets[0]);
    });

    /**
     * @target updateAsset should update asset when the asset is already stored in db
     * @dependencies
     * - database
     * @scenario
     * - insert mocked asset with old amount
     * - run test with mocked asset (call `updateAsset`)
     * - check database
     * @expected
     * - asset amount should be updated
     */
    it('should update asset when the asset is already stored in db', async () => {
      await insertAssetRecords([{ ...assets[0], amount: 1n }]);
      await assetModel.updateAsset(assets[0]);
      const savedAssets = await allAssetRecords();
      expect(savedAssets.length).to.equal(1);
      expect(savedAssets[0]).to.deep.equal(assets[0]);
    });
  });

  describe('getAllStoredAssets', () => {
    /**
     * @target getAllStoredAssets should return all asset ids stored in database
     * @dependencies
     * - database
     * @scenario
     * - insert mocked assets
     * - run test (call `getAllStoredAssets`)
     * @expected
     * - return two stored asset ids
     */
    it('should return all asset ids stored in database', async () => {
      await insertAssetRecords(assets);
      const savedAssetIds = await assetModel.getAllStoredAssets();
      expect(savedAssetIds.length).to.equal(2);
      expect(savedAssetIds).to.deep.equal([assets[0].id, assets[1].id]);
    });
  });

  describe('removeUnusedAssets', () => {
    /**
     * @target removeUnusedAssets should remove assets with specified id
     * @dependencies
     * - database
     * @scenario
     * - insert mocked assets
     * - run test (call `removeUnusedAssets`)
     * - check database
     * @expected
     * - exist only one asset
     */
    it('should remove assets with specified id', async () => {
      await insertAssetRecords(assets);
      await assetModel.removeAssets([assets[1].id]);
      const savedAssets = await allAssetRecords();
      expect(savedAssets.length).to.equal(1);
      expect(savedAssets[0]).to.deep.equal(assets[0]);
    });
  });
});
