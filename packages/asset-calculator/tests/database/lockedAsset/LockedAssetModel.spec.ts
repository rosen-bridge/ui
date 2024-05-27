import { beforeEach, describe, it } from '@vitest/runner';
import { expect } from 'vitest';

import {
  allAssetRecords,
  initDatabase,
  insertAssetRecords,
} from './LockedAssetModel.mock';
import { lockedAssets } from '../test-data';
import { LockedAssetModel } from '../../../lib/database/lockedAsset/LockedAssetModel';

describe('LockedAssetModel', () => {
  let assetModel: LockedAssetModel;
  beforeEach(async () => {
    const dataSource = await initDatabase();
    assetModel = new LockedAssetModel(dataSource);
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
      await insertAssetRecords(lockedAssets);
      const savedAssets = await assetModel.getAllStoredAssets();
      expect(savedAssets.length).toEqual(2);
      expect(
        savedAssets.sort((a, b) => a.tokenId.localeCompare(b.tokenId))
      ).toEqual(
        [
          {
            address: lockedAssets[0].address,
            tokenId: lockedAssets[0].tokenId,
          },
          {
            address: lockedAssets[1].address,
            tokenId: lockedAssets[1].tokenId,
          },
        ].sort((a, b) => a.tokenId.localeCompare(b.tokenId))
      );
    });
  });

  describe('removeAssets', () => {
    /**
     * @target removeUnusedAssets should remove assets with specified address and
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
    it('should remove assets with specified address and tokenId', async () => {
      await insertAssetRecords(lockedAssets);
      await assetModel.removeAssets([
        { address: lockedAssets[1].address, tokenId: lockedAssets[1].tokenId },
      ]);
      const savedAssets = await allAssetRecords();
      expect(savedAssets.length).toEqual(1);
      expect(savedAssets[0]).toEqual(lockedAssets[0]);
    });
  });
});
