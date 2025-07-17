import { NautilusWallet } from '@rosen-ui/nautilus-wallet';

import { ergo } from '@/networks';
import { getTokenMap } from '@/tokenMap/getClientTokenMap';

export const nautilus = new NautilusWallet({
  networks: [ergo],
  getTokenMap,
});
