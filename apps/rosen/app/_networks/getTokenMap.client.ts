import { TokenMap } from '@rosen-bridge/tokens';

import { getRosenTokens } from '@/_backend/utils';
import { cache } from '@/_utils/cache';

let tokenMap: TokenMap;

/**
 * get a TokenMap instance using the Rosen TokenMapObject in the client.
 */
export const getTokenMap = async () => {
  if (tokenMap) return tokenMap;
  const tokens = await cache(getRosenTokens, 60000)();
  tokenMap = new TokenMap(tokens);
  return tokenMap;
};
