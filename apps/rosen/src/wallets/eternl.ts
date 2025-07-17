import { EtrnlWallet } from '@rosen-ui/eternl-wallet';

import { cardano } from '@/networks';
import { getTokenMap } from '@/tokenMap/getClientTokenMap';

export const eternl = new EtrnlWallet({
  networks: [cardano],
  getTokenMap,
});
