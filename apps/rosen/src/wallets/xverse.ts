import { XverseWallet } from '@rosen-ui/xverse-wallet';

import { bitcoin, bitcoinRunes } from '@/networks';
import { getTokenMap } from '@/tokenMap/getClientTokenMap';

export const xverse = new XverseWallet({
  networks: [bitcoin, bitcoinRunes],
  getTokenMap,
});
