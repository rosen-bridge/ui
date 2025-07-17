import { OKXWallet } from '@rosen-ui/okx-wallet';

import { bitcoin } from '@/networks';
import { getTokenMap } from '@/tokenMap/getClientTokenMap';

export const okx = new OKXWallet({
  networks: [bitcoin],
  getTokenMap,
});
