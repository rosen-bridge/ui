import { MyDogeWallet } from '@rosen-ui/my-doge-wallet';

import { doge } from '@/networks';
import { getTokenMap } from '@/tokenMap/getClientTokenMap';

export const myDoge = new MyDogeWallet({
  networks: [doge],
  getTokenMap,
});
