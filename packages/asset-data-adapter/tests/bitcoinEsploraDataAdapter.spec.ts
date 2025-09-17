import { TokenMap } from '@rosen-bridge/tokens';
import { describe, it, beforeEach, expect, vi } from 'vitest';

import { BitcoinEsploraDataAdapter } from '../lib';
import { sampleTokenMapConfig } from './mocked';
import {
  rpcClientMockReturnValue,
  expectedBitcoinGetAddressAssetsResult,
} from './mocked/bitcoinBlockCypherDataAdapter.mock';

interface TestContext {
  adapter: BitcoinEsploraDataAdapter;
  mockTokenMap: TokenMap;
}

let mockClient = {
  get: vi.fn().mockReturnValue(rpcClientMockReturnValue),
};

describe('BitcoinEsploraDataAdapter', () => {
  beforeEach<TestContext>(async (ctx) => {
    vi.mock('@rosen-clients/rate-limited-axios', () => ({
      Axios: vi.fn(() => mockClient),
    }));

    ctx.mockTokenMap = new TokenMap();
    await ctx.mockTokenMap.updateConfigByJson(sampleTokenMapConfig);
    ctx.adapter = new BitcoinEsploraDataAdapter(
      ['addr1'],
      ctx.mockTokenMap,
      'http://rpc',
    );
  });

  describe('getAddressAssets', () => {
    /**
     * @target should fetch balances for native asset
     * @scenario
     * - axios client returns bitcoin balance
     * @expected
     * - result includes native bitcoin balance
     */
    it<TestContext>('should fetch balances for native asset', async ({
      adapter,
    }) => {
      const result = await adapter.getAddressAssets('addr1');

      expect(result).toEqual(expectedBitcoinGetAddressAssetsResult);
    });
  });
});
