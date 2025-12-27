import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { NATIVE_TOKEN, RosenChainToken, TokenMap } from '@rosen-bridge/tokens';
import { AssetBalance } from '@rosen-ui/asset-data-adapter';
import { NETWORKS } from '@rosen-ui/constants';

import { BridgedAssetEntity, LockedAssetEntity } from './entities';
import { NetworkItem, TotalSupply } from './types';

export class TokensAnalyzer {
  protected lockedTokens: Record<string, Omit<LockedAssetEntity, 'token'>[]>;
  protected bridgedTokens: Record<string, Omit<BridgedAssetEntity, 'token'>[]>;

  constructor(
    protected chainAssetBalanceInfo: Partial<Record<NetworkItem, AssetBalance>>,
    protected totalSupply: TotalSupply[],
    protected tokenMap: TokenMap,
    protected logger: AbstractLogger = new DummyLogger(),
  ) {}

  /**
   * Returns all locked token records grouped by native token ID.
   *
   * @returns {Record<string, Omit<LockedAssetEntity, "token">[]>} locked tokens
   */
  getLockedTokens = () => this.lockedTokens;

  /**
   * Returns all bridged token records grouped by native token ID.
   *
   * @returns {Record<string, Omit<BridgedAssetEntity, "token">[]>} bridged tokens
   */
  getBridgedTokens = () => this.bridgedTokens;

  /**
   * Adds a token to its group in the map
   *
   * @param map - tokens grouped by native id
   * @param token - token to add
   * @returns updated map
   */
  protected pushToken = <T extends { tokenId: string }>(
    map: Record<string, T[]>,
    token: T,
  ) => {
    const nativeTokenId = this.getNativeTokenId(token.tokenId);
    if (map[nativeTokenId] == undefined) map[nativeTokenId] = [];
    map[nativeTokenId].push(token);
    return map;
  };

  /**
   * Inspects all chains and collects information about
   * native, locked, and bridged tokens.
   *
   * @async
   * @returns {Promise<void>}
   */
  analyze = async () => {
    this.lockedTokens = {};
    this.bridgedTokens = {};
    for (const [chain, chainAssets] of Object.entries(
      this.chainAssetBalanceInfo,
    ) as [NetworkItem, AssetBalance][]) {
      await this.inspectChainTokens(chain, chainAssets);
    }
  };

  /**
   * Finds the native token ID for a given token ID.
   *
   * @param tokenId
   * @returns {string}
   * @throws If token set not found.
   */
  protected getNativeTokenId = (tokenId: string) => {
    const tokenSet = this.tokenMap.getTokenSet(tokenId);
    if (!tokenSet)
      throw new Error(`Can't find token-set for token by [${tokenId}] id`);
    return Object.entries(tokenSet).filter(
      ([, token]) => token.residency == NATIVE_TOKEN,
    )[0][1].tokenId;
  };

  /**
   * Inspect tokens of special chain
   *
   * @param chain
   * @param chainAssets
   */
  protected inspectChainTokens = async (
    chain: NetworkItem,
    chainAssets: AssetBalance,
  ) => {
    this.logger.debug(`Processing chain: ${chain}`);
    const tokens = this.tokenMap.getTokens(chain, chain);
    this.logger.debug(`Found ${tokens.length} tokens for ${chain} chain`);
    for (const token of tokens) {
      if (!chainAssets || chainAssets[token.tokenId] === undefined) {
        this.logger.warn(
          `Token [${token.tokenId}] not found in chain balance info for ${chain}, skipping`,
        );
        continue;
      }
      this.logger.debug(
        `Processing token [${token.tokenId}] (${token.name}) on ${chain} chain`,
      );

      const addressBalances = chainAssets[token.tokenId];
      if (token.residency == NATIVE_TOKEN) {
        addressBalances.forEach((addressBalance) => {
          this.lockedTokens = this.pushToken(this.lockedTokens, {
            amount: addressBalance.balance,
            address: addressBalance.address,
            tokenId: token.tokenId,
          });
        });
      } else {
        const bridgedAsset = await this.handleWrappedToken(
          token,
          chain,
          chainAssets,
        );
        if (bridgedAsset)
          this.bridgedTokens = this.pushToken(this.bridgedTokens, bridgedAsset);
      }
    }
  };

  /**
   * Computes bridged amount for wrapped token
   *
   * @param token
   * @param chain
   * @param chainAssets
   */
  private handleWrappedToken = async (
    token: RosenChainToken,
    chain: NetworkItem,
    chainAssets: AssetBalance,
  ) => {
    this.logger.debug(
      `Token [${token.tokenId}] is wrapped token, storing as bridged asset`,
    );

    const tokenDataOnAllChains = this.tokenMap.search(chain, {
      tokenId: token.tokenId,
    })?.[0];

    const nativeToken = Object.entries(tokenDataOnAllChains)
      .filter(([, v]) => v.residency == NATIVE_TOKEN)
      .at(0);

    if (!nativeToken) {
      this.logger.error(
        `Bridged id of token [${token.tokenId}] not found in provided token-map`,
      );
      return;
    }

    const assetTotalSupply = this.totalSupply
      .filter(
        (t) =>
          t.assetId ==
          this.tokenMap.getID(tokenDataOnAllChains, NETWORKS.ergo.key),
      )
      .at(0);

    if (!assetTotalSupply) {
      this.logger.error(
        `Total-supply of token [${token.tokenId}] not found in provided total supply data`,
      );
      return;
    }

    const lockedAmount = chainAssets[token.tokenId]
      .map((addressBalance) => addressBalance.balance)
      .reduce((acc: bigint, cur: bigint) => {
        return BigInt(acc) + BigInt(cur);
      }, 0n);
    const bridgedAmount =
      BigInt(assetTotalSupply.totalSupply) - BigInt(lockedAmount);

    this.logger.debug(
      `Token [${token.tokenId}]: total supply=${assetTotalSupply.totalSupply}, locked=${lockedAmount}, bridged=${bridgedAmount}`,
    );

    return {
      amount: bridgedAmount,
      chain: chain,
      tokenId: nativeToken[1].tokenId,
      bridgedTokenId: token.tokenId,
    };
  };
}
