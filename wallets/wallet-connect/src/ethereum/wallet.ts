import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';

import { WalletConnectEVM } from '../evm';

export class WalletConnectEthereum extends WalletConnectEVM {
  currentChain: Network = NETWORKS.ethereum.key;
}
