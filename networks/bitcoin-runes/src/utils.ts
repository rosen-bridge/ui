import {
  calculateFeeCreator,
  getMinTransferCreator as getMinTransferCreatorBase,
} from '@rosen-network/base';
import { NETWORKS } from '@rosen-ui/constants';

export const getHeight = async (): Promise<number> => {
  const response = await fetch(
    `${process.env.BITCOIN_ESPLORA_API}/api/blocks/tip/height`,
  );

  const height = await response.json();

  return height;
};

export const calculateFee = calculateFeeCreator(
  NETWORKS['bitcoin-runes'].key,
  getHeight,
);

export const getMinTransferCreator = getMinTransferCreatorBase(
  NETWORKS['bitcoin-runes'].key,
  calculateFee,
);
