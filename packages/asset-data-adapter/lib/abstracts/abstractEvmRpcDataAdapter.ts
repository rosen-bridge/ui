import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { NATIVE_TOKEN, RosenChainToken, TokenMap } from '@rosen-bridge/tokens';
import { ethers, JsonRpcProvider } from 'ethers';

import { PartialERC20ABI } from '../constants';
import {
  ChainAssetBalance,
  EVMChainsType,
  EvmRpcDataAdapterAuthParams,
} from '../types';
import { AbstractDataAdapter } from './abstractDataAdapter';

export abstract class AbstractEvmRpcDataAdapter extends AbstractDataAdapter {
  abstract chain: EVMChainsType;
  protected fetchOffset: number;
  protected readonly provider: JsonRpcProvider;

  constructor(
    protected addresses: string[],
    protected tokenMap: TokenMap,
    protected authParams: EvmRpcDataAdapterAuthParams,
    protected chunkSize: number,
    logger?: AbstractLogger,
  ) {
    super(addresses, tokenMap, logger);

    this.provider = authParams.authToken
      ? new JsonRpcProvider(`${authParams.url}/${authParams.authToken}`)
      : new JsonRpcProvider(`${authParams.url}`);
    this.fetchOffset = 0;
  }

  /**
   * Fetches raw chain assets for a given address.
   *
   * @param {string} address - target blockchain address
   * @returns {Promise<ChainAssetBalance[]>} list of asset balances for the address
   */
  getAddressAssets = async (address: string): Promise<ChainAssetBalance[]> => {
    const assets: ChainAssetBalance[] = [];
    const supportedTokens = this.tokenMap.getTokens(this.chain, this.chain);
    const chunk = supportedTokens.slice(
      this.fetchOffset,
      this.fetchOffset + this.chunkSize,
    );

    for (const chainTokenDetails of chunk) {
      try {
        if (chainTokenDetails.type == NATIVE_TOKEN) {
          const balance = await this.provider.getBalance(address);
          assets.push({
            assetId: chainTokenDetails.tokenId,
            balance: balance,
          });
        } else {
          const contract = new ethers.Contract(
            chainTokenDetails.tokenId,
            PartialERC20ABI,
            this.provider,
          );
          const assetBalance = await contract.balanceOf(address);
          if (assetBalance == undefined)
            throw new Error(
              `Amount of a asset on the "${address}" address of ${this.chain} chain by "${chainTokenDetails.tokenId}" identity is invalid`,
            );
          assets.push({
            assetId: chainTokenDetails.tokenId,
            balance: BigInt(assetBalance),
          });
        }
      } catch (err) {
        this.logger.error(
          `Error in fetch ${this.chain} chain assets occurred: ${err}`,
        );
        if (err instanceof Error && err.stack) this.logger.debug(err.stack);
      }
    }

    this.fetchOffset += this.chunkSize;

    if (this.fetchOffset >= supportedTokens.length) this.fetchOffset = 0;

    return assets;
  };

  /**
   * Returns the raw total supply of a wrapped token on the current chain.
   *
   * @param wrappedTokenId - Identifier of the wrapped token.
   * @returns The raw total supply as a bigint (not normalized).
   */
  getRawTotalSupply = async (token: RosenChainToken) => {
    const contract = new ethers.Contract(
      token.tokenId,
      PartialERC20ABI,
      this.provider,
    );
    const totalSupply = await contract.totalSupply();
    if (totalSupply) {
      this.logger.debug(
        `Total supply of token [${token.tokenId}] on the [${this.chain}] chain is [${totalSupply}]`,
      );
      return totalSupply;
    }
    throw Error(`Total supply of token [${token.tokenId}] is not calculable`);
  };
}
