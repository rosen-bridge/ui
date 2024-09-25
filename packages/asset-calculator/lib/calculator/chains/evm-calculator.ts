import AbstractCalculator from '../abstract-calculator';
import { PartialERC20ABI } from '../../constants';

import { NATIVE_TOKEN, RosenChainToken, TokenMap } from '@rosen-bridge/tokens';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { zipWith } from 'lodash-es';
import { ethers, JsonRpcProvider } from 'ethers';
import { Network } from '@rosen-ui/types';

export class EvmCalculator extends AbstractCalculator {
  readonly chain: Network;
  private readonly provider: JsonRpcProvider;

  constructor(
    chain: Network,
    tokenMap: TokenMap,
    addresses: string[],
    url: string,
    authToken?: string,
    logger?: AbstractLogger
  ) {
    super(addresses, logger, tokenMap);
    this.chain = chain;
    this.provider = authToken
      ? new JsonRpcProvider(`${url}/${authToken}`)
      : new JsonRpcProvider(`${url}`);
  }

  /**
   * @param token Evm chain token info
   * @returns total supply of the token in the Evm chain
   */
  totalRawSupply = async (token: RosenChainToken): Promise<bigint> => {
    const contract = new ethers.Contract(
      token[this.idKey],
      PartialERC20ABI,
      this.provider
    );
    const totalSupply = await contract.totalSupply();
    if (totalSupply) {
      this.logger.debug(
        `Total supply of token [${token[this.idKey]}] is [${totalSupply}]`
      );
      return totalSupply;
    }
    throw Error(
      `Total supply of token [${token[this.idKey]}] is not calculable`
    );
  };

  /**
   * @param token Evm chain token info
   * @returns total balance in hot and cold wallets
   */
  totalRawBalance = async (token: RosenChainToken): Promise<bigint> => {
    let tokenBalance = 0n;
    const contract = new ethers.Contract(
      token[this.idKey],
      PartialERC20ABI,
      this.provider
    );
    for (const address of this.addresses) {
      const balance = await contract.balanceOf(address);
      this.logger.debug(
        `Balance of token [${
          token[this.idKey]
        }] in address [${address}] is [${balance}]`
      );
      tokenBalance += balance;
    }
    this.logger.debug(
      `Total balance of token [${token[this.idKey]}] is [${tokenBalance}]`
    );
    return tokenBalance;
  };

  /**
   * returns locked amounts of a specific token for different addresses
   * @param token
   */
  getRawLockedAmountsPerAddress = async (token: RosenChainToken) => {
    let tokenBalances: bigint[] = [];
    for (const address of this.addresses) {
      let balance = 0n;
      if (token.metaData.type == NATIVE_TOKEN) {
        balance = await this.provider.getBalance(address);
      } else {
        const contract = new ethers.Contract(
          token[this.idKey],
          PartialERC20ABI,
          this.provider
        );
        balance = await contract.balanceOf(address);
      }
      this.logger.debug(
        `balance of token [${token.name}] for address [${address}] is [${balance}]`
      );
      tokenBalances.push(balance);
    }

    return zipWith(this.addresses, tokenBalances, (address, amount) => ({
      address,
      amount,
    })).filter((amountPerAddress) => amountPerAddress.amount);
  };
}
