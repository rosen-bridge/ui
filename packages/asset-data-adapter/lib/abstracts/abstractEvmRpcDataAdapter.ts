import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { NATIVE_TOKEN, TokenMap } from '@rosen-bridge/tokens';
import { ethers, JsonRpcProvider } from 'ethers';

import { PartialERC20ABI } from '../constants';
import { ChainAssetBalance } from '../types';
import { AbstractDataAdapter } from './abstractDataAdapter';

export abstract class AbstractEvmRpcDataAdapter extends AbstractDataAdapter {
  abstract chain: string;
  protected fetchOffset: number;
  protected readonly provider: JsonRpcProvider;

  constructor(
    protected addresses: string[],
    protected tokenMap: TokenMap,
    protected url: string,
    protected chunkSize: number,
    protected authToken?: string,
    logger?: AbstractLogger,
  ) {
    super(addresses, tokenMap, logger);
    this.provider = authToken
      ? new JsonRpcProvider(`${url}/${authToken}`)
      : new JsonRpcProvider(`${url}`);

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
    let chunk = supportedTokens;
    chunk = supportedTokens.slice(
      this.fetchOffset,
      this.chunkSize + this.fetchOffset,
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
}
