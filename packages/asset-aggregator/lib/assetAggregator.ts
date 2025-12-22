import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { NATIVE_TOKEN, TokenMap } from '@rosen-bridge/tokens';
import { AssetBalance } from '@rosen-ui/asset-data-adapter';

import { BridgedAssetAction, LockedAssetAction, TokenAction } from './actions';
import { TokensAnalyzer } from './tokensAnalyzer';
import { NetworkItem, TotalSupply } from './types';

export class AssetAggregator {
  lockedAssetAction: LockedAssetAction;
  bridgedAssetAction: BridgedAssetAction;
  tokenAction: TokenAction;

  constructor(
    protected tokenMap: TokenMap,
    protected datasource: DataSource,
    protected logger: AbstractLogger = new DummyLogger(),
  ) {
    this.lockedAssetAction = new LockedAssetAction(datasource, logger);
    this.bridgedAssetAction = new BridgedAssetAction(datasource, logger);
    this.tokenAction = new TokenAction(datasource, logger);
  }

  /**
   * Initialize tokens in database
   *
   * @returns
   */
  updateTokens = async () => {
    const tokens = [];
    for (const chain of this.tokenMap.getAllChains() as NetworkItem[]) {
      // get all supported tokens by passing same chain as source and destination parameters
      const chainTokens = this.tokenMap.getTokens(chain, chain);
      for (const token of chainTokens) {
        const significantDecimal = this.tokenMap.getSignificantDecimals(
          token.tokenId,
        );
        if (!significantDecimal) {
          this.logger.error(
            `Significant-decimal of token [${token.tokenId}] is undefined`,
          );
          continue;
        }
        tokens.push({
          id: token.tokenId,
          decimal: token.decimals,
          significantDecimal: significantDecimal,
          name: token.name,
          chain: chain,
          isNative: token.type == NATIVE_TOKEN,
        });
      }
    }
    await this.tokenAction.store(tokens);

    return tokens;
  };

  /**
   * Update database by considering chainAssetBalanceInfo and totalSupply
   *
   * @param ChainAssetBalanceInfo
   * @param totalSupply
   */
  update = async (
    chainAssetBalanceInfo: Partial<Record<NetworkItem, AssetBalance>>,
    totalSupply: TotalSupply[],
  ) => {
    this.logger.debug('Starting asset aggregator update process');
    const analyzer = new TokensAnalyzer(
      chainAssetBalanceInfo,
      totalSupply,
      this.tokenMap,
      this.logger,
    );
    await analyzer.analyze();
    const tokens = await this.tokenAction.getAll();
    const lockedTokens = analyzer.getLockedTokens();
    const bridgedTokens = analyzer.getBridgedTokens();
    const usedBridgedTokens = new Set<string>();
    const usedLockedTokens = new Set<string>();
    for (const token of tokens) {
      if (bridgedTokens[token.id]) {
        await this.bridgedAssetAction.store(
          bridgedTokens[token.id].map((t) => ({
            ...t,
            token: token,
          })),
        );
        usedBridgedTokens.add(token.id);
      }
      if (lockedTokens[token.id]) {
        await this.lockedAssetAction.store(
          lockedTokens[token.id].map((t) => ({
            ...t,
            token: token,
          })),
        );
        usedLockedTokens.add(token.id);
      }
    }
    await this.bridgedAssetAction.keepOnly(Array.from(usedBridgedTokens));
    await this.lockedAssetAction.keepOnly(Array.from(usedLockedTokens));
  };
}
