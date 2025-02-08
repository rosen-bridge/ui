import { BinanceIcon } from '@rosen-bridge/icons';
import {
  Network,
  NetworkConfig,
  NetworkMaxTransferParams,
} from '@rosen-network/base';
import { NETWORKS, NETWORK_LABELS } from '@rosen-ui/constants';
import { RosenAmountValue } from '@rosen-ui/types';

export class BinanceNetwork implements Network {
  public label = NETWORK_LABELS.BINANCE;

  public lockAddress: string;

  public logo = BinanceIcon;

  public name = NETWORKS.BINANCE;

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
    return address;
  }
}
