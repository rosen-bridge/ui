import { NautilusWallet } from '@rosen-ui/nautilus-wallet';

import { ergo } from '@/_networks';
import { getTokenMap } from '@/_tokenMap/getClientTokenMap';

export const nautilus = new NautilusWallet({
  networks: [ergo],
  getTokenMap,
});
