import { Handshake as HandshakeIcon } from '@rosen-bridge/icons';
import { Network, type NetworkConfig } from '@rosen-network/base/dist/network';
import { NETWORKS } from '@rosen-ui/constants';

import type { generateLockTx } from './utils';

type HandshakeNetworkConfig = Omit<NetworkConfig, 'getMaxTransfer'> & {
  generateLockTx: ReturnType<typeof generateLockTx>;
};

export class HandshakeNetwork extends Network<HandshakeNetworkConfig> {
  public label = NETWORKS.handshake.label;

  public logo = HandshakeIcon;

  public name = NETWORKS.handshake.key;

  public generateLockTx: HandshakeNetworkConfig['generateLockTx'] = (...args) => {
    return this.config.generateLockTx(...args);
  };
}
