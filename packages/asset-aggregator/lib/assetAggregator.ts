import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { TokenMap } from '@rosen-bridge/tokens';
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

  initializeNativeTokens = async () => {
    const analyzer = new TokensAnalyzer({}, [], this.tokenMap, this.logger);
    await analyzer.analyze();
    const nativeTokens = analyzer.getNativeTokens();
    for (const nativeToken of nativeTokens)
      await this.tokenAction.store(nativeToken);
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
    const nativeTokens = await this.tokenAction.getAll();
    const lockedTokens = analyzer.getLockedTokens();
    const bridgedTokens = analyzer.getBridgedTokens();
    const usedTokens = [];
    for (const nativeToken of nativeTokens) {
      if (!lockedTokens[nativeToken.id] && !bridgedTokens[nativeToken.id])
        continue;
      usedTokens.push(nativeToken.id);
      if (bridgedTokens[nativeToken.id])
        await this.bridgedAssetAction.store(
          bridgedTokens[nativeToken.id].map((t) => ({
            ...t,
            token: nativeToken,
          })),
        );
      if (lockedTokens[nativeToken.id])
        await this.lockedAssetAction.store(
          lockedTokens[nativeToken.id].map((t) => ({
            ...t,
            token: nativeToken,
          })),
        );
    }
    await this.tokenAction.keepOnly(usedTokens);
  };
}
