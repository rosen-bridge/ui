import { TokenMap } from '@rosen-bridge/tokens';
import { NETWORKS } from '@rosen-ui/constants';
import { beforeEach, describe, expect, it, vitest } from 'vitest';

import { AssetCalculator } from '../lib';
import AbstractCalculator from '../lib/calculator/abstract-calculator';
import { initDatabase } from './database/bridgedAsset/BridgedAssetModel.mock';
import { bridgedAssets, lockedAssets, tokens } from './database/test-data';
import { tokenMapData } from './test-data';

describe('AssetCalculator', () => {
  describe('calculateEmissionForChain', () => {
    /**
     * Mock database and create the AssetCalculator instance before each test
     */
    let assetCalculator: AssetCalculator;
    beforeEach(async () => {
      const dataSource = await initDatabase();
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson(tokenMapData);
      assetCalculator = new AssetCalculator(
        tokenMap,
        {
          addresses: ['hotAddr', 'coldAddr'],
          explorerUrl: 'explorerUrl',
        },
        { addresses: ['hotAddr', 'coldAddr'], koiosUrl: 'koiosUrl' },
        { addresses: ['hotAddr', 'coldAddr'], esploraUrl: 'esploraUrl' },
        { addresses: ['hotAddr', 'coldAddr'], unisatUrl: 'unisatUrl' },
        { addresses: ['hotAddr', 'coldAddr'], rpcUrl: 'rpcUrl' },
        { addresses: ['hotAddr', 'coldAddr'], rpcUrl: 'bnbRpcUrl' },
        {
          addresses: ['hotAddr', 'coldAddr'],
          blockcypherUrl: 'blockcypherUrl',
        },
        dataSource,
      );
    });

    /**
     * @target AssetCalculator.calculateEmissionForChain should calculate
     * cardano emission of a native asset on another chain
     * @dependencies
     * - cardanoAssetCalculator
     * @scenario
     * - mock cardanoAssetCalculator, totalSupply and totalBalance
     * - run test (call `calculateEmissionForChain`)
     * @expected
     * - locked amount should be the difference of supply and balance
     */
    it('should calculate cardano emission of a native asset on another chain', async () => {
      const calculator = {
        totalSupply: () => Promise.resolve(1000n),
        totalBalance: () => Promise.resolve(900n),
      } as unknown as AbstractCalculator;
      const map = new Map([[NETWORKS.cardano.key, calculator]]);
      assetCalculator['calculatorMap'] = map;
      const totalLocked = await assetCalculator['calculateEmissionForChain'](
        tokenMapData[0].ergo,
        NETWORKS.cardano.key,
        NETWORKS.ergo.key,
      );
      expect(totalLocked).to.equal(100n);
    });

    /**
     * @target AssetCalculator.calculateEmissionForChain should calculate ergo
     * emission of a native asset on another chain
     * @dependencies
     * - ergoAssetCalculator
     * @scenario
     * - mock ergoAssetCalculator, totalSupply and totalBalance
     * - run test (call `calculateEmissionForChain`)
     * @expected
     * - locked amount should be the difference of supply and balance
     */
    it('should calculate ergo emission of a native asset on another chain', async () => {
      const calculator: AbstractCalculator = {
        totalSupply: () => Promise.resolve(1900n),
        totalBalance: () => Promise.resolve(900n),
      } as unknown as AbstractCalculator;
      const map = new Map([[NETWORKS.ergo.key, calculator]]);
      assetCalculator['calculatorMap'] = map;
      const totalLocked = await assetCalculator['calculateEmissionForChain'](
        tokenMapData[2].cardano,
        NETWORKS.ergo.key,
        NETWORKS.cardano.key,
      );
      expect(totalLocked).to.equal(1000n);
    });
  });

  describe('calculateLocked', () => {
    /**
     * Mock database and create the AssetCalculator instance before each test
     */
    let assetCalculator: AssetCalculator;
    beforeEach(async () => {
      const dataSource = await initDatabase();
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson(tokenMapData);
      assetCalculator = new AssetCalculator(
        tokenMap,
        {
          addresses: ['hotAddr', 'coldAddr'],
          explorerUrl: 'explorerUrl',
        },
        { addresses: ['hotAddr', 'coldAddr'], koiosUrl: 'koiosUrl' },
        { addresses: ['hotAddr', 'coldAddr'], esploraUrl: 'esploraUrl' },
        { addresses: ['hotAddr', 'coldAddr'], unisatUrl: 'unisatUrl' },
        { addresses: ['hotAddr', 'coldAddr'], rpcUrl: 'rpcUrl' },
        { addresses: ['hotAddr', 'coldAddr'], rpcUrl: 'bnbRpcUrl' },
        {
          addresses: ['hotAddr', 'coldAddr'],
          blockcypherUrl: 'blockcypherUrl',
        },
        dataSource,
      );
    });

    /**
     * @target AssetCalculator.calculateLocked should calculate locked amount on
     * any chain
     * @dependencies
     * - ergoAssetCalculator
     * @scenario
     * - mock ergoAssetCalculator, totalSupply, totalBalance and
     * getLockedAmountsPerAddress
     * - run test (call `calculateLocked`)
     * @expected
     * - locked amount should be correct
     */
    it('should calculate locked amount on any chain', async () => {
      const calculator = {
        totalSupply: () => Promise.resolve(1000n),
        totalBalance: () => Promise.resolve(900n),
        getLockedAmountsPerAddress: () =>
          Promise.resolve([{ address: 'hotAddr', amount: 1000n }]),
      } as unknown as AbstractCalculator;
      const map = new Map([[NETWORKS.ergo.key, calculator]]);
      assetCalculator['calculatorMap'] = map;
      const totalLocked = await assetCalculator['calculateLocked'](
        tokenMapData[0].ergo,
        NETWORKS.ergo.key,
      );
      expect(totalLocked[0].address).to.equal('hotAddr');
      expect(totalLocked[0].amount).to.equal(1000n);
    });
  });

  describe('update', () => {
    /**
     * @target AssetCalculator.update should store asset and token data for all
     * bridged tokens on all chains
     * @dependencies
     * - database
     * - AssetCalculator.calculateEmissionForChain
     * @scenario
     * - mock database with empty tables
     * - mock calculateEmissionForChain to return 1000
     * - mock calculateLocked to return 1000
     * - spy bridgedAssetModel.upsertAsset and bridgedAssetModel.removeAssets to
     * check the function calls
     * - spy lockedAssetModel.upsertAsset and lockedAssetModel.removeAssets to
     * check the function calls
     * - run test (call `update`)
     * @expected
     * - should call bridgedAssetModel.upsertAsset 3 times(for each token in
     * tokenMap)
     * - should call bridgedAssetModel.removeAssets with empty array
     * - should call lockedAssetModel.upsertAsset 3 times(for each token in
     * tokenMap)
     * - should call lockedAssetModel.removeAssets with empty array
     * - should store 3 new tokenMap assets successfully
     */
    it('should store asset and token data for all bridged tokens on all chains', async () => {
      const dataSource = await initDatabase();
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson(tokenMapData);
      const assetCalculator = new AssetCalculator(
        tokenMap,
        { addresses: ['Addr'], explorerUrl: 'explorerUrl' },
        { addresses: ['Addr'], koiosUrl: 'koiosUrl' },
        { addresses: ['Addr'], esploraUrl: 'esploraUrl' },
        { addresses: ['Addr'], unisatUrl: 'unisatUrl' },
        { addresses: ['Addr'], rpcUrl: 'rpcUrl' },
        { addresses: ['Addr'], rpcUrl: 'bnbRpcUrl' },
        { addresses: ['Addr'], blockcypherUrl: 'blockcypherUrl' },
        dataSource,
      );
      assetCalculator['calculateEmissionForChain'] = () =>
        Promise.resolve(1000n);
      assetCalculator['calculateLocked'] = () =>
        Promise.resolve([{ address: 'Addr', amount: 1000n }]);
      const upsertBridgedAssetSpy = vitest.spyOn(
        assetCalculator['bridgedAssetModel'],
        'upsertAsset',
      );
      const removeBridgedAssetSpy = vitest.spyOn(
        assetCalculator['bridgedAssetModel'],
        'removeAssets',
      );
      const upsertLockedAssetSpy = vitest.spyOn(
        assetCalculator['lockedAssetModel'],
        'upsertAsset',
      );
      const removeLockedAssetSpy = vitest.spyOn(
        assetCalculator['lockedAssetModel'],
        'removeAssets',
      );
      const insertTokenSpy = vitest.spyOn(
        assetCalculator['tokenModel'],
        'insertToken',
      );

      await assetCalculator.update();
      const allStoredBridgedAssets =
        await assetCalculator['bridgedAssetModel'].getAllStoredAssets();
      const allStoredLockedAssets =
        await assetCalculator['lockedAssetModel'].getAllStoredAssets();
      const allStoredTokens =
        await assetCalculator['tokenModel'].getAllStoredTokens();
      expect(upsertBridgedAssetSpy).to.have.toBeCalledTimes(3);
      expect(upsertLockedAssetSpy).to.have.toBeCalledTimes(3);
      expect(removeBridgedAssetSpy).to.have.toBeCalledWith([]);
      expect(removeLockedAssetSpy).to.have.toBeCalledWith([]);
      expect(insertTokenSpy).toBeCalledTimes(tokenMapData.length);
      expect(
        allStoredBridgedAssets.sort((a, b) =>
          a.tokenId.localeCompare(b.tokenId),
        ),
      ).toEqual(
        [
          {
            tokenId: tokenMapData[0].ergo.tokenId,
            chain: NETWORKS.cardano.key,
          },
          {
            tokenId: tokenMapData[1].ergo.tokenId,
            chain: NETWORKS.cardano.key,
          },
          {
            tokenId: tokenMapData[2].cardano.tokenId,
            chain: NETWORKS.ergo.key,
          },
        ].sort((a, b) => a.tokenId.localeCompare(b.tokenId)),
      );
      expect(
        allStoredLockedAssets.sort((a, b) =>
          a.tokenId.localeCompare(b.tokenId),
        ),
      ).toEqual(
        [
          { tokenId: tokenMapData[0].ergo.tokenId, address: 'Addr' },
          { tokenId: tokenMapData[1].ergo.tokenId, address: 'Addr' },
          { tokenId: tokenMapData[2].cardano.tokenId, address: 'Addr' },
        ].sort((a, b) => a.tokenId.localeCompare(b.tokenId)),
      );
      expect(allStoredTokens.sort()).toEqual(
        [
          tokenMapData[0].ergo.tokenId,
          tokenMapData[1].ergo.tokenId,
          tokenMapData[2].cardano.tokenId,
        ].sort(),
      );
    });

    /**
     * @target AssetCalculator.update should store new asset data and remove the
     * old invalid ones
     * @dependencies
     * - database
     * - AssetCalculator.calculateEmissionForChain
     * @scenario
     * - mock database with old invalid assets
     * - mock calculateEmissionForChain to return 1000
     * - spy bridgedAssetModel.upsertAsset and bridgedAssetModel.removeAssets to
     * check the function calls
     * - spy lockedAssetModel.upsertAsset and lockedAssetModel.removeAssets to
     * check the function calls
     * - run test (call `update`)
     * @expected
     * - should call bridgedAssetModel.upsertAsset 3 times (for each token in
     * tokenMap)
     * - should call bridgedAssetModel.removeAssets with all old asset ids
     * - should call lockedAssetModel.upsertAsset 3 times (for each token in
     * tokenMap)
     * - should call lockedAssetModel.removeAssets with all old asset ids
     * - should have only 3 new tokenMap assets (removed the old ones)
     */
    it('should store new asset data and remove the old invalid ones', async () => {
      const dataSource = await initDatabase();
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson(tokenMapData);
      const assetCalculator = new AssetCalculator(
        tokenMap,
        { addresses: ['Addr'], explorerUrl: 'explorerUrl' },
        { addresses: ['Addr'], koiosUrl: 'koiosUrl' },
        { addresses: ['Addr'], esploraUrl: 'esploraUrl' },
        { addresses: ['Addr'], unisatUrl: 'unisatUrl' },
        { addresses: ['Addr'], rpcUrl: 'rpcUrl' },
        { addresses: ['Addr'], rpcUrl: 'bnbRpcUrl' },
        { addresses: ['Addr'], blockcypherUrl: 'blockcypherUrl' },
        dataSource,
      );
      await assetCalculator['tokenModel']['tokenRepository'].insert(tokens);
      await assetCalculator['bridgedAssetModel'][
        'bridgedAssetRepository'
      ].insert(bridgedAssets);
      await assetCalculator['lockedAssetModel']['lockedAssetRepository'].insert(
        lockedAssets,
      );
      assetCalculator['calculateEmissionForChain'] = () =>
        Promise.resolve(1000n);
      assetCalculator['calculateLocked'] = () =>
        Promise.resolve([{ address: 'Addr', amount: 1000n }]);
      const updateBridgedAssetSpy = vitest.spyOn(
        assetCalculator['bridgedAssetModel'],
        'upsertAsset',
      );
      const removeBridgedAssetsSpy = vitest.spyOn(
        assetCalculator['bridgedAssetModel'],
        'removeAssets',
      );
      const updateLockedAssetSpy = vitest.spyOn(
        assetCalculator['lockedAssetModel'],
        'upsertAsset',
      );
      const removeLockedAssetsSpy = vitest.spyOn(
        assetCalculator['lockedAssetModel'],
        'removeAssets',
      );

      await assetCalculator.update();
      const allStoredBridgedAssets =
        await assetCalculator['bridgedAssetModel'].getAllStoredAssets();
      const allStoredLockedAssets =
        await assetCalculator['lockedAssetModel'].getAllStoredAssets();
      expect(updateBridgedAssetSpy).to.have.toBeCalledTimes(3);
      expect(updateLockedAssetSpy).to.have.toBeCalledTimes(3);
      expect(removeBridgedAssetsSpy).to.have.toBeCalledWith(
        bridgedAssets.map((asset) => ({
          tokenId: asset.tokenId,
          chain: asset.chain,
        })),
      );
      expect(removeLockedAssetsSpy).to.have.toBeCalledWith(
        lockedAssets
          .map((asset) => ({
            tokenId: asset.tokenId,
            address: asset.address,
          }))
          .sort((a, b) => a.tokenId.localeCompare(b.tokenId)),
      );
      expect(
        allStoredBridgedAssets.sort((a, b) =>
          a.tokenId.localeCompare(b.tokenId),
        ),
      ).toEqual(
        [
          {
            tokenId: tokenMapData[0].ergo.tokenId,
            chain: NETWORKS.cardano.key,
          },
          {
            tokenId: tokenMapData[1].ergo.tokenId,
            chain: NETWORKS.cardano.key,
          },
          {
            tokenId: tokenMapData[2].cardano.tokenId,
            chain: NETWORKS.ergo.key,
          },
        ].sort((a, b) => a.tokenId.localeCompare(b.tokenId)),
      );
      expect(
        allStoredLockedAssets.sort((a, b) =>
          a.tokenId.localeCompare(b.tokenId),
        ),
      ).toEqual(
        [
          { tokenId: tokenMapData[0].ergo.tokenId, address: 'Addr' },
          { tokenId: tokenMapData[1].ergo.tokenId, address: 'Addr' },
          { tokenId: tokenMapData[2].cardano.tokenId, address: 'Addr' },
        ].sort((a, b) => a.tokenId.localeCompare(b.tokenId)),
      );
    });
  });
});
