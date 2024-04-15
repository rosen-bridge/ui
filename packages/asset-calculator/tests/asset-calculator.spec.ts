import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { AssetCalculator } from '../lib';
import { tokenMap } from './test-data';
import { initDatabase } from './database/asset-model.mock';
import { CARDANO_CHAIN, ERGO_CHAIN } from '../lib/constants';
import AbstractCalculator from '../lib/calculator/abstract-calculator';
import { assets } from './database/test-data';

describe('AssetCalculator', () => {
  describe('calculateTotalLocked', () => {
    /**
     * Mock database and create the AssetCalculator instance before each test
     */
    let assetCalculator: AssetCalculator;
    beforeEach(async () => {
      const dataSource = await initDatabase();
      assetCalculator = new AssetCalculator(
        tokenMap,
        {
          addresses: ['hotAddr', 'coldAddr'],
          explorerUrl: 'explorerUrl',
        },
        { addresses: ['hotAddr', 'coldAddr'], koiosUrl: 'koiosUrl' },
        dataSource
      );
    });

    /**
     * @target AssetCalculator.calculateTotalLocked should calculate total locked of ergo native asset
     * @dependencies
     * - cardanoAssetCalculator
     * @scenario
     * - mock cardanoAssetCalculator, totalSupply and totalBalance
     * - run test (call `calculateTotalLocked`)
     * @expected
     * - should check total emitted tokens in all supported chains (cardano)
     * by subtracting the bridge balance from the total supply (1000 - 900)
     */
    it('should calculate total locked of ergo native asset', async () => {
      const calculator = {
        totalSupply: () => Promise.resolve(1000n),
        totalBalance: () => Promise.resolve(900n),
      } as unknown as AbstractCalculator;
      const map = new Map([[CARDANO_CHAIN, calculator]]);
      assetCalculator['calculatorMap'] = map;
      const totalLocked = await assetCalculator['calculateTotalLocked'](
        [CARDANO_CHAIN],
        tokenMap.tokens[0].ergo,
        ERGO_CHAIN
      );
      expect(totalLocked).to.equal(100n);
    });

    /**
     * @target AssetCalculator.calculateTotalLocked should calculate total locked of cardano native asset
     * @dependencies
     * - ergoAssetCalculator
     * @scenario
     * - mock ergoAssetCalculator, totalSupply and totalBalance
     * - run test (call `calculateTotalLocked`)
     * @expected
     * - should check total emitted tokens in all supported chains (ergo)
     * by subtracting the bridge balance from the total supply (1900 - 900)
     */
    it('should calculate total locked of cardano native asset', async () => {
      const calculator: AbstractCalculator = {
        totalSupply: () => Promise.resolve(1900n),
        totalBalance: () => Promise.resolve(900n),
      } as unknown as AbstractCalculator;
      const map = new Map([[ERGO_CHAIN, calculator]]);
      assetCalculator['calculatorMap'] = map;
      const totalLocked = await assetCalculator['calculateTotalLocked'](
        [ERGO_CHAIN],
        tokenMap.tokens[2].cardano,
        CARDANO_CHAIN
      );
      expect(totalLocked).to.equal(1000n);
    });
  });

  describe('update', () => {
    /**
     * @target AssetCalculator.update should store asset data for all tokens in tokenMap
     * @dependencies
     * - database
     * - AssetCalculator.calculateTotalLocked
     * @scenario
     * - mock database with empty tables
     * - mock calculateTotalLocked to return 1000
     * - spy assetModel.updateAsset and assetModel.removeUnusedAssets to check the function calls
     * - run test (call `update`)
     * @expected
     * - should call assetModel.updateAsset 3 times (for each token in tokenMap)
     * - should call assetModel.removeUnusedAssets with empty array
     * - should store 3 new tokenMap assets successfully
     */
    it('should store asset data for all tokens in tokenMap', async () => {
      const dataSource = await initDatabase();
      const assetCalculator = new AssetCalculator(
        tokenMap,
        { addresses: ['Addr'], explorerUrl: 'explorerUrl' },
        { addresses: ['Addr'], koiosUrl: 'koiosUrl' },
        dataSource
      );
      assetCalculator['calculateTotalLocked'] = () => Promise.resolve(1000n);
      const updateSpy = vitest.spyOn(
        assetCalculator['assetModel'],
        'updateAsset'
      );
      const removeSpy = vitest.spyOn(
        assetCalculator['assetModel'],
        'removeAssets'
      );

      await assetCalculator.update();
      const allStoredAssets = await assetCalculator[
        'assetModel'
      ].getAllStoredAssets();
      expect(updateSpy).to.have.toBeCalledTimes(3);
      expect(removeSpy).to.have.toBeCalledWith([]);
      expect(allStoredAssets.sort()).toEqual([
        tokenMap.tokens[0].ergo.tokenId,
        tokenMap.tokens[1].ergo.tokenId,
        tokenMap.tokens[2].cardano.tokenId,
      ]);
    });

    /**
     * @target AssetCalculator.update should store new asset data and remove the old invalid ones
     * @dependencies
     * - database
     * - AssetCalculator.calculateTotalLocked
     * @scenario
     * - mock database with old invalid assets
     * - mock calculateTotalLocked to return 1000
     * - spy assetModel.updateAsset and assetModel.removeUnusedAssets to check the function calls
     * - run test (call `update`)
     * @expected
     * - should call assetModel.updateAsset 3 times (for each token in tokenMap)
     * - should call assetModel.removeUnusedAssets with all old asset ids
     * - should have only 3 new tokenMap assets (removed the old ones)
     */
    it('should store new asset data and remove the old invalid ones', async () => {
      const dataSource = await initDatabase();
      const assetCalculator = new AssetCalculator(
        tokenMap,
        { addresses: ['Addr'], explorerUrl: 'explorerUrl' },
        { addresses: ['Addr'], koiosUrl: 'koiosUrl' },
        dataSource
      );
      await assetCalculator['assetModel']['assetRepository'].insert(assets);
      assetCalculator['calculateTotalLocked'] = () => Promise.resolve(1000n);
      const updateSpy = vitest.spyOn(
        assetCalculator['assetModel'],
        'updateAsset'
      );
      const removeSpy = vitest.spyOn(
        assetCalculator['assetModel'],
        'removeAssets'
      );

      await assetCalculator.update();
      const allStoredAssets = await assetCalculator[
        'assetModel'
      ].getAllStoredAssets();
      expect(updateSpy).to.have.toBeCalledTimes(3);
      expect(removeSpy).to.have.toBeCalledWith(assets.map((asset) => asset.id));
      expect(allStoredAssets.sort()).toEqual([
        tokenMap.tokens[0].ergo.tokenId,
        tokenMap.tokens[1].ergo.tokenId,
        tokenMap.tokens[2].cardano.tokenId,
      ]);
    });
  });
});
