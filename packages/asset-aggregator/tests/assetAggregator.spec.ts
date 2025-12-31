import { DataSource } from '@rosen-bridge/extended-typeorm';
import { TokenMap } from '@rosen-bridge/tokens';
import { describe, beforeEach, it, expect } from 'vitest';

import { AssetAggregator } from '../lib';
import {
  SAMPLE_TOKEN_MAP,
  SAMPLE_TOKEN_ENTITY_DATA,
} from './mocked/assetAggregator.mock';

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
     * - re-mock the getLockedTokensMock method to return a list with native erg token info in ergo chain
     * - re-mock the getBridgedTokensMock method to return a list with wrapped erg token info in binance chain
     * - call update method
     * @expected
     * - assetAggregator should call the bridgedAssetAction.store method for this bridged token
     * - assetAggregator should call the bridgedAssetAction.keepOnly method for this bridged token
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

    it<BridgedAssetTestContext>('should handle empty balance array for a token', async ({
      assetAggregator,
    }) => {
      expect(
        await assetAggregator.update({ ergo: { erg: [] } }, []),
      ).toBeUndefined();
    });
  });

  describe('updateTokens', () => {
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
