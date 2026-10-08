import { TokenMap } from '@rosen-bridge/tokens';

import { HandshakeExplorerDataAdapter } from '../lib';
import { sampleTokenMapConfig } from './mocked';
import {
  expectedHnsGetAddressAssetsResult,
  explorerClientHnsReturnValue,
} from './mocked/handshakeExplorerDataAdapter.mock';

interface TestContext {
  adapter: HandshakeExplorerDataAdapter;
  mockTokenMap: TokenMap;
}

const mockClient = {
  get: vi.fn().mockReturnValue(explorerClientHnsReturnValue),
};

describe('HandshakeExplorerDataAdapter', () => {
  beforeEach<TestContext>(async (ctx) => {
    vi.mock('@rosen-clients/rate-limited-axios', () => ({
      Axios: vi.fn(() => mockClient),
    }));

    ctx.mockTokenMap = new TokenMap();
    await ctx.mockTokenMap.updateConfigByJson(sampleTokenMapConfig);
    ctx.adapter = new HandshakeExplorerDataAdapter(
      ['addr1'],
      ctx.mockTokenMap,
      'http://hsd.ergexplorer.com',
    );
  });

  describe('getAddressAssets', () => {
    /**
     * @target should fetch balances for native asset
     * @scenario
     * - axios client returns handshake coins
     * @expected
     * - result includes native hns balance (sum of plain coin values)
     */
    it<TestContext>('should fetch balances for native asset', async ({ adapter }) => {
      const result = await adapter.getAddressAssets('addr1');

      expect(result).toEqual(expectedHnsGetAddressAssetsResult);
    });
  });

  describe('getRawTotalSupply', () => {
    /**
     * @target should return 0n for native token
     */
    it<TestContext>('should return 0n', async ({ adapter }) => {
      expect(await adapter.getRawTotalSupply()).toEqual(0n);
    });
  });
});
