import { EtrnlWallet } from '@rosen-ui/eternl-wallet';

import { cardano } from '@/_networks';
import { getTokenMap } from '@/_tokenMap/getClientTokenMap';

export const eternl = new EtrnlWallet({
  networks: [cardano],
  getTokenMap,
});
