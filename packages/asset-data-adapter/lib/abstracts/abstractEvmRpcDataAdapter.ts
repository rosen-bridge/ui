import { ethers, JsonRpcProvider } from 'ethers';

import type { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { NATIVE_TOKEN, type RosenChainToken, type TokenMap } from '@rosen-bridge/tokens';

import { PartialERC20ABI } from '../constants';
import type {
  ChainAssetBalance,
  EVMChainsType,
  EvmRpcDataAdapterAuthParams,
  FetchOffsetType,
} from '../types';
import { AbstractDataAdapter } from './abstractDataAdapter';

export abstract class AbstractEvmRpcDataAdapter extends AbstractDataAdapter {
  abstract chain: EVMChainsType;
  protected fetchOffsets: FetchOffsetType = {};
  protected readonly provider: JsonRpcProvider;
  protected totalAssets: { [address: string]: Array<ChainAssetBalance> } = {};

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
    this.fetchOffsets = addresses.reduce<FetchOffsetType>((acc, address) => {
      acc[address] = 0;
      return acc;
    }, {});
  }

  /**
   * Initializes the cached balances of an address with a zero balance
   * entry for every token supported on the current chain.
   *
   * @param {string} address - target blockchain address
   */
  protected initialize = (address: string) => {
    const tokens = this.tokenMap.getTokens(this.chain, this.chain);
    this.totalAssets[address] = [];
    for (const token of tokens) {
      this.totalAssets[address].push({ assetId: token.tokenId, balance: 0n });
    }
  };

  /**
   * Updates the cached balance of a token for an address.
   * Does nothing if the token is not present in the address cache.
   *
   * @param {string} address - target blockchain address
   * @param {string} tokenId - id of the token on the current chain
   * @param {bigint} balance - new raw balance of the token
   */
  protected updateTokenBalance = (address: string, tokenId: string, balance: bigint) => {
    this.totalAssets[address].forEach((asset) => {
      if (asset.assetId === tokenId) {
        asset.balance = balance;
      }
    });
  };

  /**
   * Syncs the cached balances of all addresses with the current token map:
   * - removes tokens that are no longer supported on the current chain
   * - adds newly supported tokens with a zero balance
   */
  protected removeUnlistedAndAddNew = () => {
    const tokenIds = new Set(
      this.tokenMap.getTokens(this.chain, this.chain).map((item) => item.tokenId),
    );
    Object.keys(this.totalAssets).forEach((address) => {
      this.totalAssets[address] = this.totalAssets[address].filter((item) =>
        tokenIds.has(item.assetId),
      );
    });
    Object.keys(this.totalAssets).forEach((address) => {
      const balances = this.totalAssets[address];
      const storedIds = new Set(balances.map((item) => item.assetId));
      tokenIds.forEach((tokenMapId) => {
        if (!storedIds.has(tokenMapId)) {
          balances.push({ assetId: tokenMapId, balance: 0n });
        }
      });
    });
  };

  /**
   * Fetches raw chain assets for a given address.
   * In each call, balances of the next `chunkSize` supported tokens are fetched
   * (round-robin) and stored in the address cache; the cached balances of all
   * supported tokens are returned.
   *
   * @param {string} address - target blockchain address
   * @returns {Promise<ChainAssetBalance[]>} list of asset balances for the address
   */
  getAddressAssets = async (address: string): Promise<ChainAssetBalance[]> => {
    if (!Object.hasOwn(this.totalAssets, address)) {
      this.initialize(address);
    }
    const supportedTokens = this.tokenMap.getTokens(this.chain, this.chain);
    let iteration = this.chunkSize;
    while (iteration > 0) {
      const offset = (this.fetchOffsets[address] ?? 0) % supportedTokens.length;
      const chainTokenDetails = supportedTokens[offset];
      this.fetchOffsets[address] = (offset + 1) % supportedTokens.length;
      iteration--;
      try {
        if (chainTokenDetails.type === NATIVE_TOKEN) {
          const balance = await this.provider.getBalance(address);
          this.updateTokenBalance(address, chainTokenDetails.tokenId, balance);
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
          this.updateTokenBalance(address, chainTokenDetails.tokenId, BigInt(assetBalance));
        }
      } catch (err) {
        this.logger.error(`Error in fetch ${this.chain} chain assets occurred: ${err}`);
        if (err instanceof Error && err.stack) this.logger.debug(err.stack);
      }
    }
    this.removeUnlistedAndAddNew();
    return this.totalAssets[address].map((item) => ({ ...item }));
  };

  /**
   * Returns the raw total supply of a wrapped token on the current chain.
   *
   * @param token Identifier of the wrapped token.
   * @returns The raw total supply as a bigint (not normalized).
   */
  getRawTotalSupply = async (token: RosenChainToken) => {
    const contract = new ethers.Contract(token.tokenId, PartialERC20ABI, this.provider);
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
