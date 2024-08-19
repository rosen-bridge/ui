import { TokenMap } from '@rosen-bridge/tokens';

import { getTokenMapObject } from './getTokenMapObject';

let tokenMap: TokenMap;

/**
 * get a TokenMap instance using the Rosen TokenMapObject in the server.
 */
export const getTokenMap = () => {
  if (tokenMap) return tokenMap;
  const tokens = getTokenMapObject();
  tokenMap = new TokenMap(tokens);
  return tokenMap;
};
