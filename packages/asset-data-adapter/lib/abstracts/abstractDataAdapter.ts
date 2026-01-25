import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import {
  NATIVE_TOKEN,
  RosenAmount,
  RosenChainToken,
  TokenMap,
} from '@rosen-bridge/tokens';
import { Network } from '@rosen-ui/types';

import { AssetBalance, ChainAssetBalance } from '../types';

export abstract class AbstractDataAdapter {
  abstract chain: Network;

  constructor(
    protected addresses: string[],
    protected tokenMap: TokenMap,
    protected readonly logger: AbstractLogger = new DummyLogger(),
  ) {}

  /**
   * Aggregates balances of all tracked addresses into a list of assets.
   *
   * @returns {Promise<AssetBalance>} list of assets with address-specific balances
   */
  public fetch = async (): Promise<AssetBalance> => {
    const chainAssets: AssetBalance = {};
    for (const address of this.addresses) {
      const assets = await this.getAddressAssets(address);
      for (const asset of assets) {
        const tokenSet = this.tokenMap.getTokenSet(asset.assetId);
        if (
          tokenSet != undefined &&
          tokenSet[this.chain] &&
          tokenSet[this.chain].tokenId == asset.assetId &&
          asset.balance > 0n
        ) {
          chainAssets[asset.assetId] = chainAssets[asset.assetId] ?? [];
          chainAssets[asset.assetId].push({
            address: address,
            balance: this.tokenMap.wrapAmount(
              asset.assetId,
              asset.balance,
              this.chain,
            ).amount,
          });
        }
      }
    }
    return chainAssets;
  };

  /**
   * Fetches raw chain assets for a given address.
   *
   * @param {string} address - target blockchain address
   * @returns {Promise<ChainAssetBalance[]>} list of asset balances for the address
   */
  abstract getAddressAssets: (address: string) => Promise<ChainAssetBalance[]>;

  /**
   * return all wrapped tokens of the chain
   *
   * @return {Promise<RosenChainToken[]>}
   */
  protected getAllWrappedTokens = (): RosenChainToken[] => {
    return this.tokenMap
      .getTokens(this.chain, this.chain)
      .filter((t) => t.type != NATIVE_TOKEN);
  };

  /**
   * Fetches raw totalSupply for all tokens on this chain.
   *
   * @returns {Promise<Record<string, RosenAmount>>} tokenId → raw totalSupply
   */
  getAllTokensTotalSupply = async (): Promise<Record<string, RosenAmount>> => {
    const totalSupplies: { [key: string]: RosenAmount } = {};
    for (const wToken of this.getAllWrappedTokens())
      totalSupplies[wToken.tokenId] = this.tokenMap.wrapAmount(
        wToken.tokenId,
        await this.getRawTotalSupply(wToken),
        this.chain,
      );
    return totalSupplies;
  };

  /**
   * Returns the raw total supply of a wrapped token on the current chain.
   *
   * @param token - wrapped token info
   * @returns The raw total supply as a bigint (not normalized).
   */
  abstract getRawTotalSupply: (token: RosenChainToken) => Promise<bigint>;
}
