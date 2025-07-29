import { calculateFeeCreator } from '@rosen-network/base';
import { EvmChains, getHeight as getHeightCore } from '@rosen-network/evm';
import { NETWORKS } from '@rosen-ui/constants';

export const getHeight = async (): Promise<number> => {
  return await getHeightCore(EvmChains.BINANCE);
};

export const calculateFee = calculateFeeCreator(
  NETWORKS.binance.key,
  getHeight,
);
