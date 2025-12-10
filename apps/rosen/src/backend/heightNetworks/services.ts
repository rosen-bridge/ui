import { Network } from '@rosen-ui/types';

import { getScannersHeights } from './repository';

export type NetworkHeight = {
  height: number;
  network: Network;
};

export const getHeightNetworks = getScannersHeights;
