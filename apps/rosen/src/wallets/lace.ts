import { LaceWallet } from '@rosen-ui/lace-wallet';

import { cardano } from '@/networks';
import { getTokenMap } from '@/tokenMap/getClientTokenMap';

export const lace = new LaceWallet({
  networks: [cardano],
  getTokenMap,
});
