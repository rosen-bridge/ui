import { NautilusWallet } from '@rosen-ui/nautilus-wallet';

import { unwrap } from '@/_safeServerAction';
import { getTokenMap } from '@/_tokenMap/getClientTokenMap';

import { generateUnsignedTx } from './server';

export const nautilus = new NautilusWallet({
  getTokenMap,
  generateUnsignedTx: unwrap(generateUnsignedTx),
});
