import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';

import { WalletConnectEVM } from '../evm';

export class WalletConnectBinance extends WalletConnectEVM {
  currentChain: Network = NETWORKS.binance.key;
}
