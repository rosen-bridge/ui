/* eslint-disable @typescript-eslint/no-explicit-any */
import { TokenMap } from '@rosen-bridge/tokens';
import { describe, it, expect } from 'vitest';

import { AssetBalance } from '../lib/interfaces';
import {
  sampleTokenMapConfig,
  sampleTokenMapConfigWithDuplicateTokenId,
  TestAdapter,
} from './mocked/abstract.mock';

describe('AbstractDataAdapter', () => {
  describe('fetch', () => {
    /**
     * @target should aggregate balances after unwrapping decimals and group by assetId
     * @scenario
     * - define two addresses (addr1, addr2) with balances:
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

      // fetch tokens that exists on the tokenMap
      const result: AssetBalance = await adapter.fetch();

      expect(result).toEqual({
        token1: [
          // in results decimals length not changed for token1
          { address: 'addr1', balance: 100n },
          { address: 'addr2', balance: 50n },
        ],
        ergo_token2: [
          // in results wrapped decimals length to 3 for token2
          // and used ergo token-id for token2 in this results
          { address: 'addr1', balance: 200n },
        ],
      });
    });

    /**
     * @target should return empty balance for a token-id accidentally duplicated on another chain
     * @scenario
     * - tokenMap contains token3 which belongs to another chain
     * - its mapped id is cardano_token3
     * - on the native chain there also exists a token with the same id cardano_token3
     * - address balance includes some of cardano_token3 token value
     * - call fetch()
     * @expected
     * - result must return empty balance for cardano_token3 since it is associated with another chain
     */
    it('should return empty balance for a token-id accidentally duplicated on another chain', async () => {
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson(
        sampleTokenMapConfigWithDuplicateTokenId as any,
      );

      const adapter = new TestAdapter(['addr1', 'addr2'], tokenMap);

      // fetch tokens that exists on the tokenMap but on the another chain
      const result: AssetBalance = await adapter.fetch();

      expect(result).toEqual({});
    });
  });
});
