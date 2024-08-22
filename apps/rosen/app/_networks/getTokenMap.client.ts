import { TokenMap } from '@rosen-bridge/tokens';

import { getRosenTokens } from '@/_backend/utils';

let tokenMap: TokenMap;

/**
 * get a TokenMap instance using the Rosen TokenMapObject in the client.
 */
export const getTokenMap = async () => {
  if (tokenMap) return tokenMap;
  const tokens = await getRosenTokens();
  tokenMap = new TokenMap(tokens);
  return tokenMap;
};
