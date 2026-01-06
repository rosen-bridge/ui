import { NETWORKS } from '@rosen-ui/constants';

import { AbstractEvmRpcDataAdapter } from '../../../../lib';

export class TestEvmRpcAdapter extends AbstractEvmRpcDataAdapter {
  chain = NETWORKS.ethereum.key;
}
