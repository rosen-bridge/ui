'use server';

import { validateAddress as validateAddressCore } from '@rosen-network/base';
import { getMaxTransferCreator as getMaxTransferCore } from '@rosen-network/ethereum';
import {
  generateLockData as generateLockDataCore,
  generateTxParameters as generateTxParametersCore,
} from '@rosen-network/evm';

import { wrap } from '@/safeServerAction';
import { getTokenMap } from '@/tokenMap/getServerTokenMap';

export const generateLockData = wrap(generateLockDataCore, {
  traceKey: 'ethereum:generateLockData',
});

export const generateTxParameters = wrap(
  generateTxParametersCore(getTokenMap),
  {
    traceKey: 'ethereum:generateTxParameters',
  },
);

export const getMaxTransfer = wrap(getMaxTransferCore(getTokenMap), {
  traceKey: 'ethereum:getMaxTransfer',
});

export const validateAddress = wrap(validateAddressCore, {
  cache: Infinity,
  traceKey: 'ethereum:validateAddress',
});
