'use server';

import { validateAddress as validateAddressCore } from '@rosen-network/base';
import {
  CalculateFee,
  calculateFeeCreator,
  getMinTransferCreator as getMinTransferCreatorBase,
} from '@rosen-network/base';
import {
  EvmChains,
  generateLockData as generateLockDataCore,
  generateTxParameters as generateTxParametersCore,
  getHeight as getHeightCore,
  getMaxTransferCreator as getMaxTransferCreatorBase,
} from '@rosen-network/evm';
import { NETWORKS } from '@rosen-ui/constants';

import { wrap } from '@/safeServerAction';
import { getTokenMap } from '@/tokenMap/getServerTokenMap';

const getHeight = async (): Promise<number> => {
  return await getHeightCore(EvmChains.BASE);
};

const calculateFeeCore: CalculateFee = calculateFeeCreator(
  NETWORKS.base.key,
  getHeight,
);

export const calculateFee = wrap(calculateFeeCore, {
  cache: 10 * 60 * 1000,
  traceKey: 'base:calculateFee',
});

export const generateLockData = wrap(generateLockDataCore, {
  traceKey: 'base:generateLockData',
});

export const generateTxParameters = wrap(
  generateTxParametersCore(getTokenMap),
  {
    traceKey: 'base:generateTxParameters',
  },
);

export const getMaxTransfer = wrap(
  getMaxTransferCreatorBase(getTokenMap, EvmChains.BASE),
  {
    traceKey: 'base:getMaxTransfer',
  },
);

export const getMinTransfer = wrap(
  getMinTransferCreatorBase(NETWORKS.base.key, calculateFeeCore)(getTokenMap),
  {
    traceKey: 'base:getMinTransfer',
  },
);

export const validateAddress = wrap(validateAddressCore, {
  cache: Infinity,
  traceKey: 'base:validateAddress',
});
