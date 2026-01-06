import { NETWORKS } from '@rosen-ui/constants';

import { AbstractEvmRpcDataAdapter } from './abstracts';

export class BinanceEvmRpcDataAdapter extends AbstractEvmRpcDataAdapter {
  chain = NETWORKS.binance.key;
}
