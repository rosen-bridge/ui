import { NETWORKS } from '@rosen-ui/constants';

import { AbstractEvmRpcDataAdapter } from './abstracts';

export class EthereumEvmRpcDataAdapter extends AbstractEvmRpcDataAdapter {
  chain = NETWORKS.ethereum.key;
}
