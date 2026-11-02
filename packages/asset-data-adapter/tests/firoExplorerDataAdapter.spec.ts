import { TokenMap } from '@rosen-bridge/tokens';

import { FiroExplorerDataAdapter } from '../lib';
import { sampleTokenMapConfig } from './mocked';
import {
  expectedFiroGetAddressAssetsResult,
  explorerClientFiroReturnValue,
} from './mocked/firoExplorerDataAdapter.mock';

interface TestContext {
  adapter: FiroExplorerDataAdapter;
  mockTokenMap: TokenMap;
}

const mockClient = {
  get: vi.fn().mockReturnValue(explorerClientFiroReturnValue),
};

describe('FiroExplorerDataAdapter', () => {
  beforeEach<TestContext>(async (ctx) => {
    vi.mock('@rosen-clients/rate-limited-axios', () => ({
      Axios: vi.fn(() => mockClient),
    }));

    ctx.mockTokenMap = new TokenMap();
    await ctx.mockTokenMap.updateConfigByJson(sampleTokenMapConfig);
    ctx.adapter = new FiroExplorerDataAdapter(
      ['addr1'],
      ctx.mockTokenMap,
      'http://explorer.firo.org',
    );
  });

  describe('getAddressAssets', () => {
    /**
     * @target should fetch balances for native asset
     * @scenario
     * - axios client returns firo balance
     * @expected
     * - result includes native firo balance
     */
    it<TestContext>('should fetch balances for native asset', async ({ adapter }) => {
      const result = await adapter.getAddressAssets('addr1');

      expect(result).toEqual(expectedFiroGetAddressAssetsResult);
    });
  });
});
