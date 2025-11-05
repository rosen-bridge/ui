import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { NATIVE_TOKEN, RosenChainToken, TokenMap } from '@rosen-bridge/tokens';
import { AssetBalance } from '@rosen-ui/asset-data-adapter';
import { NETWORKS } from '@rosen-ui/constants';

import { BridgedAssetAction, LockedAssetAction, TokenAction } from './actions';
import { TokenEntity } from './entities';
import { NetworkItem, TokensEqualTypes, TotalSupply } from './types';

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
    ChainAssetBalanceInfo: Partial<Record<NetworkItem, AssetBalance>>,
    totalSupply: TotalSupply[],
  ) => {
    this.logger.debug('Starting asset aggregator update process');
    const tokensEquality = await this.updateTokenEntities();
    const usedTokens: Set<string> = new Set<string>([]);
    for (const [chain, chainAssets] of Object.entries(
      ChainAssetBalanceInfo,
    ) as [NetworkItem, AssetBalance][]) {
      await this.handleChainUpdate(
        chain,
        chainAssets,
        totalSupply,
        usedTokens,
        tokensEquality,
      );
    }

    try {
      this.logger.debug(
        `Cleaning up unused tokens. Keeping ${usedTokens.size} tokens: ${Array.from(usedTokens).join(', ')}`,
      );
      await this.tokenAction.keepOnly(Array.from(usedTokens));
      this.logger.debug(
        'Asset aggregator update process completed successfully',
      );
    } catch (err) {
      this.logger.error(`Asset-aggregator update failed: ${err}`);
      if (err instanceof Error) {
        this.logger.error(`Asset-aggregator update failed: ${err.stack}`);
      }
    }
  };

  /**
   * Processes update flow for a single chain.
   *
   * @param chain
   * @param chainAssets
   * @param totalSupply
   * @param usedTokens
   * @param tokensEquality
   */
  private handleChainUpdate = async (
    chain: NetworkItem,
    chainAssets: AssetBalance,
    totalSupply: TotalSupply[],
    usedTokens: Set<string>,
    tokensEquality: TokensEqualTypes,
  ) => {
    this.logger.debug(`Processing chain: ${chain}`);
    const tokens = this.tokenMap.getTokens(chain, chain);
    this.logger.debug(`Found ${tokens.length} tokens for chain ${chain}`);
    for (const token of tokens) {
      await this.handleTokenUpdate(
        token,
        chain,
        chainAssets,
        totalSupply,
        usedTokens,
        tokensEquality,
      );
    }
  };

  private updateTokenEntities = async (): Promise<TokensEqualTypes> => {
    const tokensEquality: TokensEqualTypes = {};
    for (const chain of this.tokenMap.getAllChains() as NetworkItem[]) {
      const nativeTokens: TokenEntity[] = [];
      for (const nativeToken of this.tokenMap.getAllNativeTokens(chain)) {
        const significantDecimal = this.tokenMap.getSignificantDecimals(
          nativeToken.tokenId,
        );
        if (!significantDecimal) {
          this.logger.error(
            `Significant-decimal of token [${nativeToken.tokenId}] is undefined`,
          );
          continue;
        }
        nativeTokens.push({
          id: nativeToken.tokenId,
          decimal: nativeToken.decimals,
          significantDecimal: significantDecimal,
          name: nativeToken.name,
          chain: chain,
          isNative: nativeToken.type == NATIVE_TOKEN,
        });
        const tokenSet = this.tokenMap.getTokenSet(nativeToken.tokenId);
        Object.entries(tokenSet!).forEach(([, token]) => {
          tokensEquality[token.tokenId] = nativeToken.tokenId;
        });
      }
      await this.tokenAction.store(nativeTokens);
    }
    return tokensEquality;
  };

  /**
   * Handles store/update logic for a single token on a chain.
   *
   * @param token
   * @param chain
   * @param chainAssets
   * @param totalSupply
   * @param usedTokens
   * @param tokensEquality
   */
  private handleTokenUpdate = async (
    token: RosenChainToken,
    chain: NetworkItem,
    chainAssets: AssetBalance,
    totalSupply: TotalSupply[],
    usedTokens: Set<string>,
    tokensEquality: TokensEqualTypes,
  ) => {
    if (!chainAssets || chainAssets[token.tokenId] === undefined) {
      this.logger.warn(
        `Token [${token.tokenId}] not found in chain balance info for ${chain}, skipping`,
      );
      return;
    }
    this.logger.debug(
      `Processing token [${token.tokenId}] (${token.name}) on chain ${chain}`,
    );
    usedTokens.add(tokensEquality[token.tokenId]);

    if (token.residency == NATIVE_TOKEN) {
      await this.handleNativeToken(token, chainAssets);
    } else {
      await this.handleWrappedToken(token, chain, chainAssets, totalSupply);
    }
  };

  /**
   * Persists all locked balances for a native token on a chain.
   *
   * @param token
   * @param chainAssets
   */
  private handleNativeToken = async (
    token: RosenChainToken,
    chainAssets: AssetBalance,
  ) => {
    this.logger.debug(
      `Token [${token.tokenId}] is native token, storing as locked asset`,
    );
    const nativeTokenId = Object.entries(
      this.tokenMap.getTokenSet(token.tokenId)!,
    ).filter(([, token]) => token.residency == NATIVE_TOKEN)[0][1].tokenId;
    const storedToken = await this.tokenAction.getById(nativeTokenId);
    if (storedToken == null) {
      this.logger.error(
        `Related TokenEntity not found for token by [${token.tokenId}] id`,
      );
      return;
    }
    const addressBalances = chainAssets[token.tokenId];
    this.logger.debug(
      `Found ${addressBalances.length} address balances for native token [${token.tokenId}]`,
    );

    await this.lockedAssetAction.store(
      addressBalances.map((addressBalance) => {
        return {
          amount: addressBalance.balance,
          address: addressBalance.address,
          tokenId: token.tokenId,
          token: storedToken,
        };
      }),
    );

    this.logger.debug(
      `Stored ${addressBalances.length} locked assets for token [${token.tokenId}]`,
    );
  };

  /**
   * Computes bridged amount for wrapped token and stores bridged asset.
   *
   * @param token
   * @param chain
   * @param chainAssets
   * @param totalSupply
   */
  private handleWrappedToken = async (
    token: RosenChainToken,
    chain: NetworkItem,
    chainAssets: AssetBalance,
    totalSupply: TotalSupply[],
  ) => {
    this.logger.debug(
      `Token [${token.tokenId}] is wrapped token, storing as bridged asset`,
    );
    const nativeTokenId = Object.entries(
      this.tokenMap.getTokenSet(token.tokenId)!,
    ).filter(([, token]) => token.residency == NATIVE_TOKEN)[0][1].tokenId;
    const storedToken = await this.tokenAction.getById(nativeTokenId);
    if (storedToken == null) {
      this.logger.error(
        `Related TokenEntity not found for token by [${token.tokenId}] id`,
      );
      return;
    }

    const tokenDataOnAllChains = this.tokenMap.search(chain, {
      tokenId: token.tokenId,
    })[0];

    const assetTotalSupply = totalSupply.filter(
      (t) =>
        t.assetId ==
        this.tokenMap.getID(tokenDataOnAllChains, NETWORKS.ergo.key),
    );

    if (assetTotalSupply.length == 0) {
      this.logger.error(
        `Total-supply of token [${token.tokenId}] not found in provided total supply data`,
      );
      return;
    }

    const lockedAmount = chainAssets[token.tokenId]
      .map((addressBalance) => addressBalance.balance)
      .reduce((acc: bigint, cur: bigint) => BigInt(acc) + BigInt(cur), 0n);
    const bridgedAmount =
      BigInt(assetTotalSupply[0].totalSupply) - BigInt(lockedAmount);

    this.logger.debug(
      `Token [${token.tokenId}]: total supply=${assetTotalSupply[0].totalSupply}, locked=${lockedAmount}, bridged=${bridgedAmount}`,
    );

    const bridgedTokenId = Object.entries(tokenDataOnAllChains).filter(
      ([, v]) => v.residency == NATIVE_TOKEN,
    );

    if (bridgedTokenId.length == 0) {
      this.logger.error(
        `Bridged id of token [${token.tokenId}] not found in provided token-map`,
      );
      return;
    }

    await this.bridgedAssetAction.store({
      amount: bridgedAmount,
      chain: chain,
      tokenId: token.tokenId,
      token: storedToken,
      bridgedTokenId: bridgedTokenId[0][1].tokenId,
    });

    this.logger.debug(
      `Stored bridged asset for token [${token.tokenId}] on chain ${chain} with amount ${bridgedAmount}`,
    );
  };
}
