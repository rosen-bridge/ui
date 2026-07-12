/* eslint-disable @typescript-eslint/no-explicit-any */
import { DummyLogger } from '@rosen-bridge/abstract-logger';
import { TokenMap } from '@rosen-bridge/extended-tokens';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { TokenEntity } from '@rosen-ui/asset-aggregator';
import { NETWORKS } from '@rosen-ui/constants';
import type { VercelKV } from '@vercel/kv';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import {
  AbstractAssetDataAdapterService,
  AbstractTokenMapService,
} from '../../src/services/abstracts';
import { AbstractRedisService } from '../../src/services/abstracts/abstractRedisService';
import { AssetDataAdapterService } from '../../src/services/assetDataAdaptersService';
import { DBService } from '../../src/services/dbService';
import { RedisService } from '../../src/services/redisService';
import { TokenMapService } from '../../src/services/tokenMapService';
import {
  expectedErgoGetAssetsTotalSupplyResult,
  sampleTokenMapConfig,
} from './assetDataAdaptersTestData';

interface TestContext {
  service: AbstractAssetDataAdapterService;
  mockTokenMap: TokenMap;
  mockRedis: VercelKV;
  mockExplorer: { v1: { [k: string]: Mock } };
}

const mockExplorer = {
  v1: {
    getApiV1AddressesP1BalanceConfirmed: vi.fn(),
    getApiV1TokensP1: vi.fn(),
  },
};

describe('AssetDataAdapterService', () => {
  describe('getAssetsTotalSupply', () => {
    beforeEach<TestContext>(async (ctx) => {
      vi.mock('@rosen-clients/ergo-explorer', () => ({
        default: vi.fn(() => mockExplorer),
      }));

      ctx.mockTokenMap = new TokenMap();
      await ctx.mockTokenMap.updateConfigByJson(sampleTokenMapConfig);
      TokenMapService.init = vi.fn().mockImplementation(() => {
        (AbstractTokenMapService as any).instance = {
          tokenMap: ctx.mockTokenMap,
          logger: new DummyLogger(),
          getName: () => 'Mocked Token Map Service',
        };
      });
      RedisService.init = vi.fn().mockImplementation(() => {
        (AbstractRedisService as any).instance = {
          logger: new DummyLogger(),
          getName: () => 'Mocked Redis Service',
        };
      });
      await RedisService.init();
      await TokenMapService.init();
      AbstractTokenMapService.getInstance().getTokenMap = vi
        .fn()
        .mockReturnValue(ctx.mockTokenMap);

      const dataSource = new DataSource({
        type: 'sqlite',
        database: ':memory:',
        dropSchema: true,
        synchronize: true,
        entities: [TokenEntity],
      });
      DBService.init(dataSource);

      await AssetDataAdapterService.init();
      ctx.service = AbstractAssetDataAdapterService.getInstance();
      // Start the service to trigger preStart to register tokenMap and createDataAdapters
      await ctx.service['assemble']();
      await ctx.service['start']();
      ctx.mockExplorer = mockExplorer;
    });

    /**
     * @target should fetch total supply for wrapped tokens
     * @scenario
     * - tokenMap.getConfig returns multiple tokens including native ERG
     * - tokenMap.getTokenSet returns mapping for each token
     * @expected
     * - result includes native ERG total supply
     * - result includes all custom tokens with correct wrapped total supply
     */
    it<TestContext>('should fetch total supply for wrapped tokens', async ({
      service,
      mockExplorer,
    }) => {
      mockExplorer.v1.getApiV1TokensP1.mockResolvedValue({
        emissionAmount: 5000n,
      });

      service['adapters'] = {
        [NETWORKS.ergo.key]: service['adapters'][NETWORKS.ergo.key],
      };

      const result = await service.getAssetsTotalSupply();

      expect(result).toEqual(expectedErgoGetAssetsTotalSupplyResult);
    });
  });
});
