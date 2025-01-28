'use server';

import { EvmChains, getMaxTransferCreator } from '@rosen-network/evm';

import { wrap } from '@/_safeServerAction';
import { getTokenMap } from '@/_tokenMap/getServerTokenMap';

export const getMaxTransfer = wrap(
  getMaxTransferCreator(getTokenMap(), EvmChains.BINANCE),
  {
    traceKey: 'getMaxTransfer',
  },
);
