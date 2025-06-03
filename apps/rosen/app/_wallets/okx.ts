import { OKXWallet } from '@rosen-ui/okx-wallet';

import { bitcoin } from '@/_networks';
import { getTokenMap } from '@/_tokenMap/getClientTokenMap';

export const okx = new OKXWallet({
  networks: [bitcoin],
  getTokenMap,
});
