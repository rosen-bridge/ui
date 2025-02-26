import { BinanceIcon } from '@rosen-bridge/icons';
import {
  Network,
  NetworkConfig,
  NetworkMaxTransferParams,
} from '@rosen-network/base';
import { NETWORKS } from '@rosen-ui/constants';
import { RosenAmountValue } from '@rosen-ui/types';

export class BinanceNetwork implements Network {
  public label = NETWORKS.binance.label;

  public lockAddress: string;

  public logo = BinanceIcon;

  public name = NETWORKS.binance.key;

  public nextHeightInterval: number;

  constructor(protected config: NetworkConfig) {
    this.nextHeightInterval = config.nextHeightInterval;
    this.lockAddress = config.lockAddress;
  }

  public getMaxTransfer(
    params: NetworkMaxTransferParams,
  ): Promise<RosenAmountValue> {
    return this.config.getMaxTransfer(params);
  }

  public toSafeAddress(address: string): string {
    return address.toLowerCase();
  }
}
