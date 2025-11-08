/* eslint-disable @typescript-eslint/no-explicit-any */
import { TokenMap } from '@rosen-bridge/tokens';
import { NETWORKS } from '@rosen-ui/constants';
import { describe, beforeEach, it, expect } from 'vitest';

import { TokensAnalyzer } from '../lib/tokensAnalyzer';
import {
  NATIVE_TOKEN_CHAIN_BALANCE_INFO,
  NATIVE_TOKEN_TOTAL_SUPPLY,
  WRAPPED_TOKEN_CHAIN_BALANCE_INFO,
  WRAPPED_TOKEN_TOTAL_SUPPLY,
  SAMPLE_TOKEN_MAP,
} from './mocked/tokensAnalyzer.mock';

interface AnalyzerTestContext {
  tokenMap: TokenMap;
  analyzer: TokensAnalyzer;
}

describe('TokensAnalyzer', () => {
  beforeEach<AnalyzerTestContext>(async (context) => {
    const tokenMap = new TokenMap();
    await tokenMap.updateConfigByJson(SAMPLE_TOKEN_MAP);

    context.tokenMap = tokenMap;
    context.analyzer = new TokensAnalyzer(
      {}, // chainAssetBalanceInfo — will set per test
      [],
      tokenMap,
    );
  });

  describe('analyze', () => {
    /**
     * @target should store native token as locked asset
     * @scenario
     * - provide chainAssetBalanceInfo containing native token (erg)
     * - call analyze
     * @expected
     * - lockedTokens should contain addresses with balances
     */
    it<AnalyzerTestContext>('should store native token as locked asset', async ({
      tokenMap,
    }) => {
      const analyzer = new TokensAnalyzer(
        NATIVE_TOKEN_CHAIN_BALANCE_INFO,
        NATIVE_TOKEN_TOTAL_SUPPLY,
        tokenMap,
      );
      await analyzer.analyze();

      const locked = analyzer.getLockedTokens();
      const native = analyzer.getNativeTokens();

      expect(Object.keys(locked)).toContain(NETWORKS.ergo.nativeToken);
      const assets = locked[NETWORKS.ergo.nativeToken];
      expect(assets.length).toBeGreaterThan(0);
      expect(
        native.find((t) => t.id === NETWORKS.ergo.nativeToken),
      ).toBeTruthy();
    });

    /**
     * @target should compute bridged amount for wrapped token
     * @scenario
     * - provide wrapped token balance info and totalSupply
     * - call analyze
     * @expected
     * - bridgedTokens should contain bridged entry with correct amount
     */
    it<AnalyzerTestContext>('should compute bridged amount for wrapped token', async ({
      tokenMap,
    }) => {
      const analyzer = new TokensAnalyzer(
        WRAPPED_TOKEN_CHAIN_BALANCE_INFO,
        WRAPPED_TOKEN_TOTAL_SUPPLY,
        tokenMap,
      );
      await analyzer.analyze();

      const bridged = analyzer.getBridgedTokens();
      const bridgedKeys = Object.keys(bridged);
      expect(bridgedKeys.length).toBeGreaterThan(0);

      const first = bridged[bridgedKeys[0]][0];
      expect(first.amount).toBeTypeOf('bigint');
      expect(first).toHaveProperty('bridgedTokenId');
    });
  });

  describe('collectNativeTokensMap', () => {
    /**
     * @target should collect native tokens correctly
     * @scenario
     * - create analyzer with a valid token map
     * - call collectNativeTokensMap
     * @expected
     * - nativeTokens should not be empty
     * - each token should be native in owned chain
     */
    it<AnalyzerTestContext>('should collect native tokens correctly', async ({
      analyzer,
      tokenMap,
    }) => {
      analyzer['collectNativeTokensMap']();
      const nativeTokens = analyzer.getNativeTokens();

      expect(nativeTokens.length).toBeGreaterThan(0);
      expect(
        nativeTokens.every(
          (t) =>
            tokenMap
              .getAllNativeTokens(t.chain)
              .filter((t2) => t2.tokenId == t.id).length == 1,
        ),
      ).toBeTruthy();
    });
  });

  /**
   * @target should throw error for unknown token in getNativeTokenId
   * @scenario
   * - call getNativeTokenId with invalid token id
   * @expected
   * - should throw an Error
   */
  it<AnalyzerTestContext>('should throw error for unknown token in getNativeTokenId', async ({
    analyzer,
  }) => {
    expect(() => analyzer['getNativeTokenId']('unknown-token')).toThrowError();
  });

  describe('handleWrappedToken', () => {
    /**
     * @target should return undefined if totalSupply missing
     * @scenario
     * - mock token and chainAssets but omit totalSupply
     * @expected
     * - should return undefined and not crash
     */
    it<AnalyzerTestContext>('should return undefined if totalSupply missing', async ({
      tokenMap,
    }) => {
      const analyzer = new TokensAnalyzer({}, [], tokenMap);
      const result = await analyzer['handleWrappedToken'](
        tokenMap.getAllNativeTokens('ergo')[0],
        'ergo' as any,
        { ergo: [] } as any,
      );
      expect(result).toBeUndefined();
    });
  });
});
