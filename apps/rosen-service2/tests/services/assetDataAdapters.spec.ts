/* eslint-disable @typescript-eslint/no-explicit-any */
import { DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { TokenMap } from '@rosen-bridge/tokens';
import { TokenEntity } from '@rosen-ui/asset-calculator';
import { NETWORKS } from '@rosen-ui/constants';
import { describe, it, beforeEach, expect, vi, Mock } from 'vitest';

import { AssetDataAdapterService } from '../../src/services/assetDataAdapters';
import { DBService } from '../../src/services/db';
import { TokensConfig } from '../../src/tokensConfig';
import {
  expectedErgoGetAssetsTotalSupplyResult,
  sampleTokenMapConfig,
} from './mocked/assetDataAdapters.mock';

interface TestContext {
  service: AssetDataAdapterService;
  mockTokenMap: TokenMap;
  mockExplorer: { v1: { [k: string]: Mock } };
}

let mockExplorer = {
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
      TokensConfig.init = vi.fn().mockImplementation(() => {
        (TokensConfig as any).instance = {
          tokenMap: ctx.mockTokenMap,
          logger: new DummyLogger(),
        };
      });
      await TokensConfig.init();
      TokensConfig.getInstance().getTokenMap = vi
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
      ctx.service = AssetDataAdapterService.getInstance();

      ctx.mockExplorer = mockExplorer;
    });

    /**
     * @target should fetch total supply for native and custom tokens
     * @scenario
     * - tokenMap.getConfig returns multiple tokens including native ERG
     * - tokenMap.getTokenSet returns mapping for each token
     * @expected
     * - result includes native ERG total supply
     * - result includes all custom tokens with correct wrapped total supply
     */
    it<TestContext>('should fetch total supply for native and custom tokens', async ({
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
