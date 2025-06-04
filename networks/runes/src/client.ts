import { Runes as RunesIcon } from '@rosen-bridge/icons';
import {
  Network,
  NetworkConfig,
  NetworkMaxTransferParams,
} from '@rosen-network/base';
import { NETWORKS } from '@rosen-ui/constants';
import { RosenAmountValue } from '@rosen-ui/types';

export class RunesNetwork implements Network {
  public label = NETWORKS.runes.label;

  public lockAddress: string;

  public logo = RunesIcon;

  public name = NETWORKS.runes.key;

  public nextHeightInterval: number;

  constructor(protected config: NetworkConfig) {
    this.nextHeightInterval = config.nextHeightInterval;
    this.lockAddress = config.lockAddress;
  }

  public getMaxTransfer = (
    params: NetworkMaxTransferParams,
  ): Promise<RosenAmountValue> => {
    return this.config.getMaxTransfer(params);
  };

  public toSafeAddress = (address: string): string => {
    return address;
  };
}
