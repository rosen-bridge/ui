import { TokenMap } from '@rosen-bridge/tokens';

import { getRosenTokens } from './getRosenTokens';

let tokenMap: TokenMap;

/**
 * get a TokenMap instance using the Rosen TokenMapObject in the server.
 */
export const getTokenMap = async () => {
  if (tokenMap) return tokenMap;
  const tokens = await getRosenTokens();
  tokenMap = new TokenMap(tokens);
  return tokenMap;
};
