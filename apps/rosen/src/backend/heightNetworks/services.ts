import { Network } from '@rosen-ui/types';

import { getHeightBlocksRepo } from './repository';

export type NetworkHeight = {
  height: number;
  network: Network;
};

export const getHeightNetworks = async () => {
  const data = await getHeightBlocksRepo();
  return data;
};
