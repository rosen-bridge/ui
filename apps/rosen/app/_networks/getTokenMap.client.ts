import { TokenMap } from '@rosen-bridge/tokens';

import { getTokenMapObject } from './getTokenMapObject';

let tokenMap: TokenMap;

/**
 * get a TokenMap instance using the Rosen TokenMapObject in the client.
 */
export const getTokenMap = async () => {
  if (tokenMap) return tokenMap;
  const tokens = await getTokenMapObject();
  tokenMap = new TokenMap(tokens);
  return tokenMap;
};
