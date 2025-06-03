import { LaceWallet } from '@rosen-ui/lace-wallet';

import { cardano } from '@/_networks';
import { getTokenMap } from '@/_tokenMap/getClientTokenMap';

export const lace = new LaceWallet({
  networks: [cardano],
  getTokenMap,
});
