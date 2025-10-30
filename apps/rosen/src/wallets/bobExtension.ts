import { BobExtensionWallet } from '@rosen-ui/bob-extension';

import { handshake } from '@/networks';
import { getTokenMap } from '@/tokenMap/getClientTokenMap';

export const bobExtension = new BobExtensionWallet({
  networks: [handshake],
  getTokenMap,
});
