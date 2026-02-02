import { ShakeWallet } from '@rosen-ui/shake-wallet';

import { handshake } from '@/networks';
import { getTokenMap } from '@/tokenMap/getClientTokenMap';

export const shakeWallet = new ShakeWallet({
  networks: [handshake],
  getTokenMap,
  lockScriptHex: 'd07657877c58879b',
  lockedNames: ['ccj3'],
  publicNodeUrl: 'https://api.handshakeapi.com/hsd',
});
