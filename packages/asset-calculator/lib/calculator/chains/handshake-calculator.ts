import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import axios, { Axios } from '@rosen-bridge/rate-limited-axios';
import { NATIVE_TOKEN, RosenChainToken, TokenMap } from '@rosen-bridge/tokens';
import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';
import { zipWith } from 'lodash-es';

import AbstractCalculator from '../abstract-calculator';

/**
 * This type only contains the part of the type that is required here
 */
interface PartialHandshakeRpcAddress {
  confirmed: number;
  unconfirmed: number;
}

export class HandshakeCalculator extends AbstractCalculator {
  readonly chain: Network = NETWORKS.handshake.key;

  protected client: Axios;

  constructor(
    tokenMap: TokenMap,
    addresses: string[],
    url: string,
    logger?: AbstractLogger,
  ) {
    super(addresses, logger, tokenMap);
    this.client = axios.create({
      baseURL: url,
    });
  }

  /**
   * @param token Handshake chain token supply, always 0
   */
  totalRawSupply = async (): Promise<bigint> => {
    return 0n;
  };

  /**
   * @param token Handshake chain token balance, always 0
   */
  totalRawBalance = async (): Promise<bigint> => {
    return 0n;
  };

  /**
   * returns locked amounts of a specific token for different addresses
   * @param token
   */
  getRawLockedAmountsPerAddress = async (token: RosenChainToken) => {
    if (token.type === NATIVE_TOKEN) {
      const balances = await Promise.all(
        this.addresses.map(async (address) => {
          try {
            // RPC call to get address balance
            const response = await this.client.post<{
              result: PartialHandshakeRpcAddress;
            }>('', {
              method: 'getaddressbalance',
              params: [address],
            });
            const balance = response.data.result;
            return BigInt(balance.confirmed);
          } catch (error) {
            this.logger?.warn(
              `Failed to get balance for Handshake address ${address}: ${error}`,
            );
            return 0n;
          }
        }),
      );
      return zipWith(this.addresses, balances, (address, amount) => ({
        address,
        amount,
      })).filter((amountPerAddress) => amountPerAddress.amount);
    }

    return [];
  };
}
