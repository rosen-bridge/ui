import { TokenMap } from '@rosen-bridge/tokens';
import crypto from 'node:crypto';

import { getOnChainRosenTokens } from './getOnChainRosenTokens';
import { getRosenTokens } from './getRosenTokens';

let tokenMap: TokenMap;

/**
 * get a TokenMap instance using the Rosen TokenMapObject in the server.
 */
export const getTokenMap = async () => {
  if (tokenMap) return tokenMap;

  tokenMap = new TokenMap();

  if (process.env.USE_OCTM === 'true') {
    const tokenMapJSON = JSON.stringify(tokenMap.getConfig());
    const tokenMapHash = crypto.hash('sha256', tokenMapJSON);

    const storedTokenMap = await getOnChainRosenTokens();

    if (storedTokenMap && tokenMapHash !== storedTokenMap.hash) {
      tokenMap = new TokenMap();
      await tokenMap.updateConfigByJson(storedTokenMap.tokenMap);
    }
  } else {
    const tokens = await getRosenTokens();
    await tokenMap.updateConfigByJson(tokens);
  }

  return tokenMap;
};
