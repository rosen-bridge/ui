import { TokenMap } from '@rosen-bridge/tokens';
import { NETWORKS } from '@rosen-ui/constants';

import { TokensAnalyzer } from '../lib/tokensAnalyzer';
import {
  NATIVE_TOKEN_CHAIN_BALANCE_INFO,
  SAMPLE_ANALYZER_BRIDGED_TOKEN,
  SAMPLE_ANALYZER_BRIDGED_TOKEN_2,
  SAMPLE_TOKEN_MAP,
  WRAPPED_TOKEN_CHAIN_BALANCE_INFO,
  WRAPPED_TOKEN_TOTAL_SUPPLY,
} from './tokensAnalyzerTestData';

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
      {},
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
    it<AnalyzerTestContext>('should store native token as locked asset', async ({ tokenMap }) => {
      const analyzer = new TokensAnalyzer(
        NATIVE_TOKEN_CHAIN_BALANCE_INFO,
        WRAPPED_TOKEN_TOTAL_SUPPLY,
        tokenMap,
      );
      await analyzer.analyze();

      expect(analyzer['lockedTokens'].map((l) => l.tokenId)).toContain(NETWORKS.ergo.nativeToken);
      expect(analyzer['bridgedTokens'][0].amount).toBeTypeOf('bigint');
      expect(analyzer['bridgedTokens']).toEqual([
        ...SAMPLE_ANALYZER_BRIDGED_TOKEN_2,
        ...SAMPLE_ANALYZER_BRIDGED_TOKEN,
      ]);
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

      expect(analyzer['bridgedTokens'][0].amount).toBeTypeOf('bigint');
      expect(analyzer['bridgedTokens']).toEqual([SAMPLE_ANALYZER_BRIDGED_TOKEN[0]]);
    });

    /**
     * @target should bridge full total supply for empty balance list
     * @dependencies
     * - TokensAnalyzer
     * - TokenMap
     * - WRAPPED_TOKEN_TOTAL_SUPPLY
     * @scenario
     * - provide wrapped token with empty balance list, total supply 10000n
     * - call analyze
     * @expected
     * - bridgedTokens should contain an entry with amount equal to total supply
     */
    it<AnalyzerTestContext>('should bridge full total supply for empty balance list', async ({
      tokenMap,
    }) => {
      const wrappedId = '92f7cec6d682e8a0d965e6d93de66ec18933f72181c59a5d85802f0fe2afc900';
      const analyzer = new TokensAnalyzer(
        { ergo: { [wrappedId]: [] } },
        WRAPPED_TOKEN_TOTAL_SUPPLY,
        tokenMap,
      );
      await analyzer.analyze();

      expect(analyzer['bridgedTokens']).toEqual([
        { amount: 10000n, chain: 'ergo', tokenId: 'bnb', bridgedTokenId: wrappedId },
      ]);
    });
  });

  describe('handleWrappedToken', () => {
    /**
     * @target should correctly calculate and store bridged amount for wrapped token
     * @dependencies
     * - TokensAnalyzer
     * - TokenMap
     * - WRAPPED_TOKEN_CHAIN_BALANCE_INFO
     * - WRAPPED_TOKEN_TOTAL_SUPPLY
     * @scenario
     * - create tokenMap with wrapped token definition
     * - provide totalSupply for native token
     * - provide locked balance for wrapped token
     * - call analyze()
     * @expected
     * - getBridgedTokens returns one record
     * - record.amount equals totalSupply - lockedAmount
     * - tokenId is native token id
     * - bridgedTokenId is wrapped token id
     * - chain equals wrapped token chain
     */
    it('should correctly calculate bridged amount for wrapped token', async () => {
      const tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson(SAMPLE_TOKEN_MAP);

      const analyzer = new TokensAnalyzer(
        WRAPPED_TOKEN_CHAIN_BALANCE_INFO,
        WRAPPED_TOKEN_TOTAL_SUPPLY,
        tokenMap,
      );

      await analyzer.analyze();

      const bridged = analyzer.getBridgedTokens();
      expect(bridged).toHaveLength(1);

      const token = bridged[0];

      const totalSupply = BigInt(WRAPPED_TOKEN_TOTAL_SUPPLY.ergo[0].totalSupply);

      const lockedAmount = BigInt(
        WRAPPED_TOKEN_CHAIN_BALANCE_INFO.ergo[SAMPLE_TOKEN_MAP[2].ergo.tokenId]
          .map((item: { balance: bigint }) => item.balance)
          .reduce((old: bigint, current: bigint) => old + current),
      );

      const expected = totalSupply - lockedAmount;

      expect(token.amount).toEqual(expected);
      expect(token.tokenId).toEqual(SAMPLE_TOKEN_MAP[2].binance.tokenId);
      expect(token.bridgedTokenId).toEqual(SAMPLE_TOKEN_MAP[2].ergo.tokenId);
      expect(token.chain).toEqual('ergo');
    });
  });
});
