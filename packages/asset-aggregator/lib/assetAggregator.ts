import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { NATIVE_TOKEN, TokenMap } from '@rosen-bridge/tokens';
import { AssetBalance } from '@rosen-ui/asset-data-adapter';

import { BridgedAssetAction, LockedAssetAction, TokenAction } from './actions';
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
   * Update database by considering ChainAssetBalanceInfo and totalSupply
   * @param ChainAssetBalanceInfo
   * @param totalSupply
   */
  update = async (
    ChainAssetBalanceInfo: Record<NetworkItem, AssetBalance>,
    totalSupply: TotalSupply[],
  ) => {
    this.logger.debug('Starting asset aggregator update process');
    const usedTokens: string[] = [];

    for (const chain of Object.keys(ChainAssetBalanceInfo)) {
      this.logger.debug(`Processing chain: ${chain}`);
      const tokens = this.tokenMap.getTokens(chain, chain);
      this.logger.debug(`Found ${tokens.length} tokens for chain ${chain}`);

      for (const token of tokens) {
        if (
          ChainAssetBalanceInfo[chain as NetworkItem][token.tokenId] ==
          undefined
        ) {
          this.logger.debug(
            `Token ${token.tokenId} not found in chain balance info for ${chain}, skipping`,
          );
          continue;
        }
        this.logger.debug(
          `Processing token ${token.tokenId} (${token.name}) on chain ${chain}`,
        );
        const storedToken = (
          await this.tokenAction.insert({
            id: token.tokenId,
            decimal: token.decimals,
            name: token.name,
            chain: chain as NetworkItem,
            isNative: token.residency == NATIVE_TOKEN,
          })
        )[0];
        usedTokens.push(storedToken.id);
        const chainAssets = ChainAssetBalanceInfo[chain as NetworkItem];

        if (token.residency == NATIVE_TOKEN) {
          this.logger.debug(
            `Token ${token.tokenId} is native token, storing as locked asset`,
          );
          const addressBalances = chainAssets[token.tokenId];
          this.logger.debug(
            `Found ${addressBalances.length} address balances for native token ${token.tokenId}`,
          );

          await Promise.all(
            addressBalances.map(async (addressBalance) => {
              await this.lockedAssetAction.store({
                amount: addressBalance.balance,
                address: addressBalance.address,
                tokenId: token.tokenId,
                token: storedToken,
              });
            }),
          );

          this.logger.debug(
            `Stored ${addressBalances.length} locked assets for token ${token.tokenId}`,
          );
        } else {
          this.logger.debug(
            `Token ${token.tokenId} is wrapped token, storing as bridged asset`,
          );
          const assetTotalSupply = totalSupply.filter(
            (t) => t.assetId == token.tokenId,
          );

          if (assetTotalSupply.length == 0) {
            this.logger.error(
              `Total-supply of token ${token.tokenId} not found in provided total supply data`,
            );
            continue;
          }

          const tokenDataOnAllChains = this.tokenMap.search(chain, {
            tokenId: storedToken.id,
          })[0];

          const lockedAmount = chainAssets[token.tokenId]
            .map((addressBalance) => addressBalance.balance)
            .reduce((acc, cur) => acc + cur, 0n);
          const bridgedAmount = assetTotalSupply[0].totalSupply - lockedAmount;

          this.logger.debug(
            `Token ${token.tokenId}: total supply=${assetTotalSupply[0].totalSupply}, locked=${lockedAmount}, bridged=${bridgedAmount}`,
          );

          await this.bridgedAssetAction.store({
            amount: bridgedAmount,
            chain: chain as NetworkItem,
            tokenId: token.tokenId,
            token: storedToken,
            bridgedTokenId: this.tokenMap.getID(tokenDataOnAllChains, chain),
          });

          this.logger.debug(
            `Stored bridged asset for token ${token.tokenId} on chain ${chain} with amount ${bridgedAmount}`,
          );
        }
      }
    }

    this.logger.debug(
      `Cleaning up unused tokens. Keeping ${usedTokens.length} tokens: ${usedTokens.join(', ')}`,
    );
    await this.tokenAction.keepOnly(usedTokens);
    this.logger.debug('Asset aggregator update process completed successfully');
  };
}
