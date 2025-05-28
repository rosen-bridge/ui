import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { RosenChainToken, TokenMap } from '@rosen-bridge/tokens';
import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';
import axios, { AxiosInstance } from 'axios';
import { zipWith } from 'lodash-es';

import AbstractCalculator from '../abstract-calculator';

export class RunesCalculator extends AbstractCalculator {
  readonly chain: Network = NETWORKS.runes.key;

  protected client: AxiosInstance;

  constructor(
    tokenMap: TokenMap,
    addresses: string[],
    url: string = 'https://open-api.unisat.io',
    logger?: AbstractLogger,
  ) {
    super(addresses, logger, tokenMap);
    this.client = axios.create({
      baseURL: url,
    });
  }

  /**
   * @param token Bitcoin chain token supply, always 0
   */
  totalRawSupply = async (): Promise<bigint> => {
    return 0n;
  };

  /**
   * @param token Bitcoin chain token balance, always 0
   */
  totalRawBalance = async (): Promise<bigint> => {
    return 0n;
  };

  /**
   * returns locked amounts of a specific token for different addresses
   * @param token
   */
  getRawLockedAmountsPerAddress = async (token: RosenChainToken) => {
    const tokenBalances = await Promise.all(
      this.addresses.map(async (address) => {
        const response = await this.client.get<
          UnisatResponse<AddressRunesBalance>
        >(`/v1/indexer/address/${address}/runes/${token.tokenId}/balance`);

        return response.data.data ? BigInt(response.data.data.amount) : 0n;
      }),
    );

    return zipWith(this.addresses, tokenBalances, (address, amount) => ({
      address,
      amount,
    })).filter((amountPerAddress) => amountPerAddress.amount);
  };
}

export type UnisatResponse<T> = {
  code: number;
  msg: string;
  data: T | null;
};

export type AddressRunesBalance = {
  amount: string;
  runeid: string;
  rune: string;
  spacedRune: string;
  symbol: string;
  divisibility: number;
};

export type RuneInfo = {
  runeid: string;
  rune: string;
  spacedRune: string;
  number: number;
  height: number;
  txidx: number;
  timestamp: number;
  divisibility: number;
  symbol: string;
  etching: string;
  premine: string;
  terms: RuneInfoTerms;
  mints: string;
  burned: string;
  holders: number;
  transactions: number;
  supply: string;
  start: number;
  end: number;
  mintable: boolean;
  remaining: string;
};

export type RuneInfoTerms = {
  amount: string;
  cap: string;
  heightStart: number;
  heightEnd: number;
  offsetStart: number | null;
  offsetEnd: number | null;
};
