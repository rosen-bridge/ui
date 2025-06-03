import { XverseWallet } from '@rosen-ui/xverse-wallet';

import { bitcoin } from '@/_networks';
import { getTokenMap } from '@/_tokenMap/getClientTokenMap';

export const xverse = new XverseWallet({
  networks: [bitcoin],
  getTokenMap,
});
