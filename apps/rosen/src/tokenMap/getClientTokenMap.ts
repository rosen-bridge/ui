import { TokenMap } from '@rosen-bridge/tokens';

import { unwrap } from '@/safeServerAction';

import { getRosenTokensWithCache } from './getRosenTokens';

let tokenMap: TokenMap;

/**
 * get a TokenMap instance using the Rosen TokenMapObject in the client.
 */
export const getTokenMap = async () => {
  if (tokenMap) return tokenMap;
  const tokens = await unwrap(getRosenTokensWithCache)();
  tokenMap = new TokenMap();
  await tokenMap.updateConfigByJson(tokens);
  return tokenMap;
};
