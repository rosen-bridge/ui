import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { NATIVE_TOKEN, TokenMap } from '@rosen-bridge/tokens';
import { ethers, JsonRpcProvider } from 'ethers';

import { PartialERC20ABI } from '../constants';
import { ChainAssetBalance } from '../types';
import { AbstractDataAdapter } from './abstractDataAdapter';

export abstract class AbstractEvmRpcDataAdapter extends AbstractDataAdapter {
  abstract chain: string;
  protected readonly provider: JsonRpcProvider;

  constructor(
    protected addresses: string[],
    protected tokenMap: TokenMap,
    protected url: string,
    protected authToken?: string,
    logger?: AbstractLogger,
  ) {
    super(addresses, tokenMap, logger);
    this.provider = authToken
      ? new JsonRpcProvider(`${url}/${authToken}`)
      : new JsonRpcProvider(`${url}`);
  }

  /**
   * Fetches raw chain assets for a given address.
   *
   * @param {string} address - target blockchain address
   * @returns {Promise<ChainAssetBalance[]>} list of asset balances for the address
   */
  getAddressAssets = async (address: string): Promise<ChainAssetBalance[]> => {
    const rosenTokens = this.tokenMap.getConfig();
    const assets = (
      await Promise.all(
        Object.values(rosenTokens).map(async (tokenSet) => {
          try {
            const chainTokenDetails = tokenSet[this.chain];
            if (!chainTokenDetails) return undefined;
            if (chainTokenDetails.type == NATIVE_TOKEN) {
              const balance = await this.provider.getBalance(address);
              return {
                assetId: chainTokenDetails.tokenId,
                balance: balance,
              };
            }
            const contract = new ethers.Contract(
              chainTokenDetails.tokenId,
              PartialERC20ABI,
              this.provider,
            );
            const assetBalance = await contract.balanceOf(address);
            if (assetBalance == undefined)
              throw new Error(
                `Amount of a asset on the"${address}" address of ${this.chain} chain by "${chainTokenDetails.tokenId}" identity is invalid`,
              );
            return {
              assetId: chainTokenDetails.tokenId,
              balance: BigInt(assetBalance),
            };
          } catch {
            return undefined;
          }
        }),
      )
    ).filter((assetBalance) => assetBalance != undefined);
    return assets;
  };
}
