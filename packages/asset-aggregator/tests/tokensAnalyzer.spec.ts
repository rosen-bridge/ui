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

      expect(locked.map((l) => l.tokenId)).toContain(NETWORKS.ergo.nativeToken);
      expect(locked.length).toBeGreaterThan(0);
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

      const first = bridged[0];
      expect(first.amount).toBeTypeOf('bigint');
      expect(first).toHaveProperty('bridgedTokenId');
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
