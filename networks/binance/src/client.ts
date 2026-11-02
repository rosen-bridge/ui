import { Binance as BinanceIcon } from '@rosen-bridge/icons';
import { Network, type NetworkConfig } from '@rosen-network/base/dist/network';
import type { generateLockTx } from '@rosen-network/evm';
import { NETWORKS } from '@rosen-ui/constants';

type BinanceNetworkConfig = NetworkConfig & {
  generateLockTx: ReturnType<typeof generateLockTx>;
};

export class BinanceNetwork extends Network<BinanceNetworkConfig> {
  public label = NETWORKS.binance.label;

  public logo = BinanceIcon;

  public name = NETWORKS.binance.key;

  public generateLockTx: BinanceNetworkConfig['generateLockTx'] = (...args) => {
    return this.config.generateLockTx(...args);
  };

  public toSafeAddress = (address: string): string => {
    return address.toLowerCase();
  };
}
