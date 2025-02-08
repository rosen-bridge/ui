import { BitcoinIcon } from '@rosen-bridge/icons';
import {
  Network,
  NetworkConfig,
  NetworkMaxTransferParams,
} from '@rosen-network/base';
import { NETWORKS, NETWORK_LABELS } from '@rosen-ui/constants';
import { RosenAmountValue } from '@rosen-ui/types';

export class BitcoinNetwork implements Network {
  public label = NETWORK_LABELS.BITCOIN;

  public lockAddress: string;

  public logo = BitcoinIcon;

  public name = NETWORKS.BITCOIN;

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
