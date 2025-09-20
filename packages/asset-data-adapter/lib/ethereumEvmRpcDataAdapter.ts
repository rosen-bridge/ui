import { NETWORKS } from '@rosen-ui/constants';

import { AbstractEvmRpcDataAdapter } from './abstracts';

export class EthereumEvmRpcDataAdapter extends AbstractEvmRpcDataAdapter {
  chain: string = NETWORKS.ethereum.key;
}
