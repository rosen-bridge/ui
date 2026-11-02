import { ShakeWallet } from '@rosen-ui/shake-wallet';

import { handshake } from '@/networks';
import { getTokenMap } from '@/tokenMap/getClientTokenMap';

export const shakeWallet = new ShakeWallet({
  networks: [handshake],
  getTokenMap,
});
