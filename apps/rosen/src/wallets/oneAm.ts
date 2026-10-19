import { OneAmWallet } from '@rosen-ui/1am-wallet';

import { cardano } from '@/networks';
import { getTokenMap } from '@/tokenMap/getClientTokenMap';

export const oneAm = new OneAmWallet({
  networks: [cardano],
  getTokenMap,
});
