import { CardanoIcon } from '@rosen-bridge/icons';
import {
  Network,
  NetworkConfig,
  NetworkMaxTransferParams,
} from '@rosen-network/base';
import { NETWORKS, NETWORK_LABELS } from '@rosen-ui/constants';
import { RosenAmountValue } from '@rosen-ui/types';

export class CardanoNetwork implements Network {
  public label = NETWORK_LABELS.CARDANO;

  public lockAddress: string;

  public logo = CardanoIcon;

  public name = NETWORKS.CARDANO;

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
