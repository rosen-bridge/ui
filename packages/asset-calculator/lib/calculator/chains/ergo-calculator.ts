import { RosenChainToken } from '@rosen-bridge/tokens';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';

import AbstractCalculator from '../abstract-calculator';

export class ErgoCalculator extends AbstractCalculator {
  private explorerApi;

  constructor(
    addresses: string[],
    explorerUrl: string,
    logger?: AbstractLogger
  ) {
    super(addresses, logger);
    this.explorerApi = ergoExplorerClientFactory(explorerUrl);
  }

  /**
   * @param token Ergo chain token info
   * @returns total supply of the token in Ergo
   */
  totalSupply = async (token: RosenChainToken): Promise<bigint> => {
    const tokenDetail = await this.explorerApi.v1.getApiV1TokensP1(
      token.tokenId
    );
    if (tokenDetail) {
      this.logger.debug(
        `Total supply of token [${token}] is [${tokenDetail.emissionAmount}]`
      );
      return tokenDetail.emissionAmount;
    }
    throw Error('Total supply is not calculable');
  };

  /**
   * @param token Ergo chain token info
   * @returns total balance in hot and cold wallets
   */
  totalBalance = async (token: RosenChainToken): Promise<bigint> => {
    let tokenBalance = 0n;
    for (const address of this.addresses) {
      const balance =
        await this.explorerApi.v1.getApiV1AddressesP1BalanceConfirmed(address);
      const addressTokenBalance = balance.tokens!.filter(
        (asset) => asset.tokenId == token.tokenId
      )[0].amount;
      this.logger.debug(
        `Balance of token [${token}] in address [${address}] is [${addressTokenBalance}]`
      );
      tokenBalance += addressTokenBalance;
    }
    this.logger.debug(`Total balance of token [${token}] is [${tokenBalance}]`);
    return tokenBalance;
  };
}
