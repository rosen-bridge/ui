import {
  calculateFeeCreator,
  getMinTransferCreator as getMinTransferCreatorBase,
} from '@rosen-network/base';
import { EvmChains, getHeight as getHeightCore } from '@rosen-network/evm';
import { NETWORKS } from '@rosen-ui/constants';

export const getHeight = async (): Promise<number> => {
  return await getHeightCore(EvmChains.ETHEREUM);
};

export const calculateFee = calculateFeeCreator(
  NETWORKS.ethereum.key,
  getHeight,
);

export const getMinTransferCreator = getMinTransferCreatorBase(
  NETWORKS.ethereum.key,
  calculateFee,
);
