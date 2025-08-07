import { XverseWallet } from '@rosen-ui/xverse-wallet';

import { bitcoin } from '@/networks';
import { getTokenMap } from '@/tokenMap/getClientTokenMap';

export const xverse = new XverseWallet({
  networks: [bitcoin],
  getTokenMap,
});
