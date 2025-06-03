import { MyDogeWallet } from '@rosen-ui/my-doge-wallet';

import { doge } from '@/_networks';
import { getTokenMap } from '@/_tokenMap/getClientTokenMap';

export const myDoge = new MyDogeWallet({
  networks: [doge],
  getTokenMap,
});
