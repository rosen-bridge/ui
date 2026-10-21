import type { Network as NetworkName, RosenAmountValue } from '@rosen-ui/types';

import type { CalculateFee } from './calculateFeeCreator';
import type { getMinTransferCreator } from './getMinTransferCreator';

/**
 * Fetches the native token balance of an address
 * @returns this is a UNWRAPPED-VALUE amount
 */
export type GetAddressBalance = (address: string) => Promise<bigint>;

export interface NetworkMaxTransferParams {
  balance: RosenAmountValue;
  isNative: boolean;
  eventData: {
    toChain: NetworkName;
    fromAddress: string;
    toAddress: string;
  };
}

export interface NetworkConfig {
  nextHeightInterval: number;
  lockAddress: string;
  calculateFee: CalculateFee;
  /**
   * Leave it out for networks that cannot fetch an address balance
   */
  getAddressBalance?: GetAddressBalance;
  /**
   * Leave it out for networks that have no max transfer limit
   */
  getMaxTransfer?(params: NetworkMaxTransferParams): Promise<RosenAmountValue>;
  getMinTransfer: ReturnType<ReturnType<typeof getMinTransferCreator>>;
  validateAddress(chain: NetworkName, walletAddress: string): Promise<boolean>;
}

export abstract class Network<Config extends NetworkConfig = NetworkConfig> {
  public abstract label: string;

  public lockAddress: string;

  public abstract logo: string;

  public abstract name: NetworkName;

  public nextHeightInterval: number;

  constructor(protected config: Config) {
    this.nextHeightInterval = config.nextHeightInterval;
    this.lockAddress = config.lockAddress;

    if (config.getAddressBalance) {
      this.getAddressBalance = (address) => {
        return this.config.getAddressBalance!(address);
      };
    }
  }

  public calculateFee: CalculateFee = (...args) => {
    return this.config.calculateFee(...args);
  };

  /**
   * Only defined when the network config provides it
   */
  public getAddressBalance?: GetAddressBalance;

  public getMaxTransfer = async (params: NetworkMaxTransferParams): Promise<RosenAmountValue> => {
    if (!this.config.getMaxTransfer) return BigInt(Number.MAX_VALUE);
    return this.config.getMaxTransfer(params);
  };

  public getMinTransfer: NetworkConfig['getMinTransfer'] = (...args) => {
    return this.config.getMinTransfer(...args);
  };

  public toSafeAddress = (address: string): string => {
    return address;
  };

  public validateAddress = (walletAddress: string): Promise<boolean> => {
    return this.config.validateAddress(this.name, walletAddress);
  };
}
