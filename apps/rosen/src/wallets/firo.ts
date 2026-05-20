import { FiroWallet } from '@rosen-ui/firo';

import { firo } from '@/networks';
import { getTokenMap } from '@/tokenMap/getClientTokenMap';

export const firoWallet = new FiroWallet({
  networks: [firo],
  getTokenMap,
});
