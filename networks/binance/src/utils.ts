import {
  calculateFeeCreator,
  getMinTransferCreator as getMinTransferCreatorBase,
} from '@rosen-network/base';
import { EvmChains, getHeight as getHeightCore } from '@rosen-network/evm';
import { NETWORKS } from '@rosen-ui/constants';

export const getHeight = async (): Promise<number> => {
  return await getHeightCore(EvmChains.BINANCE);
};

export type CalculateFee = ReturnType<typeof calculateFeeCreator>;

export const calculateFee: CalculateFee = calculateFeeCreator(
  NETWORKS.binance.key,
  getHeight,
);

export const getMinTransferCreator = getMinTransferCreatorBase(
  NETWORKS.binance.key,
  calculateFee,
);
