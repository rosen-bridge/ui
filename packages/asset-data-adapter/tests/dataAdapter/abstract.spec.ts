/* eslint-disable @typescript-eslint/no-explicit-any */
import { TokenMap } from '@rosen-bridge/tokens';
import { describe, it, expect } from 'vitest';

import { AssetBalance } from '../../lib/interfaces';
import {
  sampleTokenMapConfig,
  TestAdapter,
} from '../mocked/dataAdapter/abstract.mock';

describe('AbstractDataAdapter', () => {
  describe('fetch', () => {
    /**
     * @target should aggregate balances after unwrapping decimals and group by assetId
     * @scenario
     * - define two addresses (addr1, addr2) with balances:
     *
     *   - addr1 has token0=100n, token1=100n and token2=200n
     *   - addr2 has token0=300n and token1=50n
     * - tokenMap contains both token1 and token2
     * - call fetch()
     * @expected
     * - result groups balances by assetId and ignore token0
     */
    it('should aggregate balances after unwrapping decimals and group by assetId', async () => {
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson(sampleTokenMapConfig as any);

      const adapter = new TestAdapter(['addr1', 'addr2'], tokenMap);

      const result: AssetBalance = adapter.fetch();

      expect(result).toEqual({
        token1: [
          { address: 'addr1', balance: 100n },
          { address: 'addr2', balance: 50n },
        ],
        ergo_token2: [{ address: 'addr1', balance: 200n }],
      });
    });
  });
});
