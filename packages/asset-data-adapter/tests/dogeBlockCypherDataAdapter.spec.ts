import { TokenMap } from '@rosen-bridge/tokens';
import { describe, it, beforeEach, expect, vi } from 'vitest';

import { DogeBlockCypherDataAdapter } from '../lib';
import { sampleTokenMapConfig } from './mocked';
import {
  blockCypherClientDogeReturnValue,
  expectedDogeGetAddressAssetsResult,
} from './mocked/dogeBlockCypherDataAdapter.mock';

interface TestContext {
  adapter: DogeBlockCypherDataAdapter;
  mockTokenMap: TokenMap;
}

let mockClient = {
  get: vi.fn().mockReturnValue(blockCypherClientDogeReturnValue),
};

describe('DogeBlockCypherDataAdapter', () => {
  beforeEach<TestContext>(async (ctx) => {
    vi.mock('@rosen-clients/rate-limited-axios', () => ({
      Axios: vi.fn(() => mockClient),
    }));

    ctx.mockTokenMap = new TokenMap();
    await ctx.mockTokenMap.updateConfigByJson(sampleTokenMapConfig);
    ctx.adapter = new DogeBlockCypherDataAdapter(
      ['addr1'],
      ctx.mockTokenMap,
      'http://blockcypher',
    );
  });

  describe('getAddressAssets', () => {
    /**
     * @target should fetch balances for native asset
     * @scenario
     * - axios client returns doge balance
     * @expected
     * - result includes native doge balance
     */
    it<TestContext>('should fetch balances for native asset', async ({
      adapter,
    }) => {
      const result = await adapter.getAddressAssets('addr1');

      expect(result).toEqual(expectedDogeGetAddressAssetsResult);
    });
  });
});
