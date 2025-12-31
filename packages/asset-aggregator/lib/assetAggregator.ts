import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { NATIVE_TOKEN, TokenMap } from '@rosen-bridge/tokens';

import { BridgedAssetAction, LockedAssetAction, TokenAction } from './actions';
import { TokensAnalyzer } from './tokensAnalyzer';
import { AssetBalance, NetworkItem, TotalSupply } from './types';

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
    const bridgedTokens = analyzer.getBridgedTokens();
    const lockedTokens = analyzer.getLockedTokens();

    // store used locked and bridged tokens
    await this.bridgedAssetAction.store(bridgedTokens);
    await this.lockedAssetAction.store(lockedTokens);
    // remove unused locked and bridged tokens
    await this.bridgedAssetAction.keepOnly(
      Object.values(bridgedTokens).map((t) => t.tokenId),
    );
    await this.lockedAssetAction.keepOnly(
      Object.values(lockedTokens)
        .flat()
        .map((t) => t.tokenId),
    );
  };
}
