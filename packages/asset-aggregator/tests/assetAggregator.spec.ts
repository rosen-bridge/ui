import { DataSource } from '@rosen-bridge/extended-typeorm';
import { TokenMap } from '@rosen-bridge/tokens';
import { describe, beforeEach, it, expect } from 'vitest';

import { AssetAggregator } from '../lib';
import {
  SAMPLE_TOKEN_MAP,
  SAMPLE_TOKEN_ENTITY_DATA,
} from './assetAggregatorTestData';

interface BridgedAssetTestContext {
  assetAggregator: AssetAggregator;
}

const analyzeMock = vi.fn();
const getBridgedTokensMock = vi.fn().mockReturnValue([]);
const getLockedTokensMock = vi.fn().mockReturnValue([]);

vi.mock('../lib/tokensAnalyzer', () => {
  return {
    TokensAnalyzer: vi.fn().mockImplementation(() => ({
      analyze: analyzeMock,
      getBridgedTokens: getBridgedTokensMock,
      getLockedTokens: vi.fn().mockReturnValue([SAMPLE_TOKEN_MAP[0]['ergo']]),
    })),
  };
});

describe('AssetAggregator', () => {
  beforeEach<BridgedAssetTestContext>(async (context) => {
    vi.clearAllMocks();

    const tokenMap = new TokenMap();
    await tokenMap.updateConfigByJson(SAMPLE_TOKEN_MAP);
    tokenMap['tokensConfig'] = SAMPLE_TOKEN_MAP;

    const mockedDataSource = {
      getRepository: vi.fn().mockReturnValue({
        deleteAll: vi.fn(),
        find: vi.fn(),
      }),
    } as unknown as DataSource;

    const aggregator = new AssetAggregator(tokenMap, mockedDataSource);

    // mock actions (no DB)
    aggregator.tokenAction.store = vi.fn();
    aggregator.bridgedAssetAction.store = vi.fn();
    aggregator.lockedAssetAction.store = vi.fn();
    aggregator.bridgedAssetAction.keepOnly = vi.fn();
    aggregator.lockedAssetAction.keepOnly = vi.fn();

    context.assetAggregator = aggregator;
  });

  describe('update', () => {
    /**
     * @target should store token as locked asset
     * @dependencies
     * - assetAggregator
     * @scenario
     * - re-mock the getLockedTokensMock method to return a list with erg token info
     * - call update method
     * @expected
     * - assetAggregator should call the lockedAssetAction.store method for this locked token
     * - assetAggregator should call the lockedAssetAction.keepOnly method only for this locked token
     */
    it<BridgedAssetTestContext>('should store native token as locked asset', async ({
      assetAggregator,
    }) => {
      getLockedTokensMock.mockReturnValue([SAMPLE_TOKEN_MAP[0].ergo]);
      getBridgedTokensMock.mockReturnValue([]);
      await assetAggregator.update({}, []);
      expect(assetAggregator['lockedAssetAction'].store).toBeCalledWith([
        SAMPLE_TOKEN_MAP[0]['ergo'],
      ]);
      expect(assetAggregator['lockedAssetAction'].keepOnly).toBeCalledWith([
        SAMPLE_TOKEN_MAP[0]['ergo'].tokenId,
      ]);
    });

    /**
     * @target should store wrapped token as bridged asset
     * @dependencies
     * - assetAggregator
     * @scenario
     * - mock locked tokens to include native-asset(erg) on ergo chain
     * - mock bridged tokens to include wrapped erg on binance chain
     * - call update method
     * @expected
     * - assetAggregator should store wrapped token as bridged asset
     * - assetAggregator should keepOnly bridged token ids
     */
    it<BridgedAssetTestContext>('should store wrapped token as bridged asset', async ({
      assetAggregator,
    }) => {
      getLockedTokensMock.mockReturnValue([SAMPLE_TOKEN_MAP[0].ergo]);
      getBridgedTokensMock.mockReturnValue([SAMPLE_TOKEN_MAP[0].binance]);
      await assetAggregator.update({}, []);
      expect(assetAggregator['bridgedAssetAction'].store).toBeCalledWith([
        SAMPLE_TOKEN_MAP[0].binance,
      ]);
      expect(assetAggregator['bridgedAssetAction'].keepOnly).toBeCalledWith([
        SAMPLE_TOKEN_MAP[0].binance.tokenId,
      ]);
    });

    /**
     * @target should handle both native and wrapped tokens in same chain
     * @dependencies
     * - assetAggregator
     * @scenario
     * - mock locked tokens so that list contains native tokens on different chains
     * - mock bridged tokens so that list contains wrapped versions on opposite chains
     * - call update method
     * @expected
     * - bridgedAssetAction.store should be called with wrapped tokens
     * - bridgedAssetAction.keepOnly should be called with wrapped tokenIds
     * - lockedAssetAction.store should be called only for native tokens
     * - lockedAssetAction.keepOnly should be called only for native tokenIds
     */
    it<BridgedAssetTestContext>('should handle both native and wrapped tokens in same chain', async ({
      assetAggregator,
    }) => {
      getLockedTokensMock.mockReturnValue([
        SAMPLE_TOKEN_MAP[0].ergo,
        SAMPLE_TOKEN_MAP[2].binance,
      ]);
      getBridgedTokensMock.mockReturnValue([
        SAMPLE_TOKEN_MAP[2].ergo,
        SAMPLE_TOKEN_MAP[0].binance,
      ]);
      await assetAggregator.update({}, []);
      expect(assetAggregator['bridgedAssetAction'].store).toBeCalledWith([
        SAMPLE_TOKEN_MAP[2].ergo,
        SAMPLE_TOKEN_MAP[0].binance,
      ]);
      expect(assetAggregator['bridgedAssetAction'].keepOnly).toBeCalledWith([
        SAMPLE_TOKEN_MAP[2].ergo.tokenId,
        SAMPLE_TOKEN_MAP[0].binance.tokenId,
      ]);
      expect(assetAggregator['lockedAssetAction'].store).toBeCalledWith([
        SAMPLE_TOKEN_MAP[0].ergo,
      ]);
      expect(assetAggregator['lockedAssetAction'].keepOnly).toBeCalledWith([
        SAMPLE_TOKEN_MAP[0].ergo.tokenId,
      ]);
    });

    /**
     * @target should handle empty balance array for a token
     * @dependencies
     * - assetAggregator
     * @scenario
     * - call update with a balance object where a token balance array is empty
     * @expected
     * - update method should complete without error
     * - returned value should be undefined
     */
    it<BridgedAssetTestContext>('should handle empty balance array for a token', async ({
      assetAggregator,
    }) => {
      expect(
        await assetAggregator.update({ ergo: { erg: [] } }, []),
      ).toBeUndefined();
    });
  });

  describe('updateTokens', () => {
    /**
     * @target should collect tokens correctly
     * @dependencies
     * - assetAggregator
     * @scenario
     * - call updateTokens method
     * @expected
     * - tokenAction.store should be called with token entity data from token map
     */
    it<BridgedAssetTestContext>('should collect tokens correctly', async ({
      assetAggregator,
    }) => {
      await assetAggregator.updateTokens();

      // fetch list of tokenIds from database
      expect(assetAggregator['tokenAction'].store).toBeCalledWith(
        SAMPLE_TOKEN_ENTITY_DATA,
      );
    });
  });
});
