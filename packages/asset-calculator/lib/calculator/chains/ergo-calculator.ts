import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { NATIVE_TOKEN, RosenChainToken, TokenMap } from '@rosen-bridge/tokens';
import ergoExplorerClientFactory, { V1 } from '@rosen-clients/ergo-explorer';
import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';
import { zipWith } from 'lodash-es';

import AbstractCalculator from '../abstract-calculator';

export class ErgoCalculator extends AbstractCalculator {
  readonly chain: Network = NETWORKS.ergo.key;

  private explorerApi;

  constructor(
    tokenMap: TokenMap,
    addresses: string[],
    explorerUrl: string,
    logger?: AbstractLogger,
  ) {
    super(addresses, logger, tokenMap);
    this.explorerApi = ergoExplorerClientFactory(explorerUrl);
  }

  /**
   * @param token Ergo chain token info
   * @returns total supply of the token in Ergo
   */
  totalRawSupply = async (token: RosenChainToken): Promise<bigint> => {
    const tokenDetail = await this.explorerApi.v1.getApiV1TokensP1(
      token.tokenId,
    );
    if (tokenDetail) {
      this.logger.debug(
        `Total supply of token [${token.tokenId}] is [${tokenDetail.emissionAmount}]`,
      );
      return tokenDetail.emissionAmount;
    }
    throw Error(`Total supply of token [${token.tokenId}] is not calculable`);
  };

  /**
   * @param token Ergo chain token info
   * @returns total balance in hot and cold wallets
   */
  totalRawBalance = async (token: RosenChainToken): Promise<bigint> => {
    let tokenBalance = 0n;
    for (const address of this.addresses) {
      const balance =
        await this.explorerApi.v1.getApiV1AddressesP1BalanceConfirmed(address);
      const addressTokenBalance =
        balance.tokens!.filter((asset) => asset.tokenId == token.tokenId)[0]
          ?.amount ?? 0n;
      this.logger.debug(
        `Balance of token [${token.name}] in address [${address}] is [${addressTokenBalance}]`,
      );
      tokenBalance += addressTokenBalance;
    }
    this.logger.debug(
      `Total balance of token [${token.name}] is [${tokenBalance}]`,
    );
    return tokenBalance;
  };

  /**
   * extract balance of a specific token from a `Balance` object
   * @param token
   * @param addressBalance
   */
  private getTokenBalanceFromAddressBalance = (
    token: RosenChainToken,
    addressBalance: V1.Balance,
  ) => {
    if (token.type === NATIVE_TOKEN) {
      return addressBalance.nanoErgs;
    }
    const tokenBalance = addressBalance.tokens?.find(
      (addressBalanceToken) => addressBalanceToken.tokenId === token.tokenId,
    );

    return tokenBalance?.amount ?? 0n;
  };

  /**
   * returns locked amounts of a specific token for different addresses
   * @param token
   */
  getRawLockedAmountsPerAddress = async (token: RosenChainToken) => {
    const addressBalances = await Promise.all(
      this.addresses.map((address) =>
        this.explorerApi.v1.getApiV1AddressesP1BalanceConfirmed(address),
      ),
    );
    const tokenBalances = addressBalances.map((balance) =>
      this.getTokenBalanceFromAddressBalance(token, balance),
    );

    return zipWith(this.addresses, tokenBalances, (address, amount) => ({
      address,
      amount,
    })).filter((amountPerAddress) => amountPerAddress.amount);
  };
}
