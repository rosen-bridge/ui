import { TokenMap } from '@rosen-bridge/tokens';

import { getRosenTokensWithCache } from '@/_backend/utils';
import { unwrap } from '@/_safeServerAction';

let tokenMap: TokenMap;

/**
 * get a TokenMap instance using the Rosen TokenMapObject in the client.
 */
export const getTokenMap = async () => {
  if (tokenMap) return tokenMap;
  const tokens = await unwrap(getRosenTokensWithCache)();
  tokenMap = new TokenMap(tokens);
  return tokenMap;
};
