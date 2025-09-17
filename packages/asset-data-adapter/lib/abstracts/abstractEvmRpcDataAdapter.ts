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
    protected authToken?: string,
    protected fetchSize: number | undefined = undefined,
    fetchInitialOffset: number = 1,
    logger?: AbstractLogger,
  ) {
    super(addresses, tokenMap, logger);
    this.provider = authToken
      ? new JsonRpcProvider(`${url}/${authToken}`)
      : new JsonRpcProvider(`${url}`);

    this.setOffset(fetchInitialOffset);
  }

  /**
   * Resets the fetch offset back to the initial value (1).
   *
   */
  public resetOffset = () => {
    this.fetchOffset = 1;
  };

  /**
   * Sets the fetch offset to a specific positive number.
   *
   * @param {number} offset - The new starting offset (must be greater than 0)
   * @throws {Error} If offset is less than 1
   */
  public setOffset = (offset: number) => {
    if (offset < 1)
      throw new Error(`Invalid fetch-start-offset value: ${offset}`);
    this.fetchOffset = offset;
  };

  /**
   * Fetches raw chain assets for a given address.
   *
   * @param {string} address - target blockchain address
   * @returns {Promise<ChainAssetBalance[]>} list of asset balances for the address
   */
  getAddressAssets = async (address: string): Promise<ChainAssetBalance[]> => {
    const fetchOffset = this.fetchOffset;
    let counter = 0;
    const assets: ChainAssetBalance[] = [];
    const supportedTokens = this.tokenMap.getTokens(this.chain, this.chain);
    for (const chainTokenDetails of supportedTokens) {
      try {
        // Considering fetch size and other conditions
        counter += 1;
        if (this.fetchSize && counter < fetchOffset) continue;
        if (this.fetchSize && counter >= fetchOffset + this.fetchSize) break;
        this.fetchOffset += 1;

        if (chainTokenDetails.type == NATIVE_TOKEN) {
          const balance = await this.provider.getBalance(address);
          assets.push({
            assetId: chainTokenDetails.tokenId,
            balance: balance,
          });
        }
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
      } catch (err) {
        this.logger.error(
          `Error in fetch ${this.chain} chain assets occurred: ${err}`,
        );
        if (err instanceof Error && err.stack) this.logger.debug(err.stack);
      }
    }

    if (this.fetchOffset > supportedTokens.length) this.resetOffset();

    return assets;
  };
}
