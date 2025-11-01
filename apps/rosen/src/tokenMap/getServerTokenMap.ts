import { TokenMap } from '@rosen-bridge/tokens';
import crypto from 'crypto';

import { getOnChainRosenTokens } from './getOnChainRosenTokens';
import { getRosenTokens } from './getRosenTokens';

let tokenMap: TokenMap;

/**
 * get a TokenMap instance using the Rosen TokenMapObject in the server.
 */
export const getTokenMap = async () => {
  if (process.env.USE_OCTM === 'true') {
    const storedTokenMap = await getOnChainRosenTokens();

    if (!tokenMap) {
      tokenMap = new TokenMap();
    }

    const tokenMapJSON = JSON.stringify(tokenMap.getConfig());
    const tokenMapHash = crypto.hash('sha256', tokenMapJSON);

    if (tokenMapHash !== storedTokenMap.hash) {
      await tokenMap.updateConfigByJson(storedTokenMap.tokenMap);
    }
  } else {
    if (tokenMap) return tokenMap;
    tokenMap = new TokenMap();
    const tokens = await getRosenTokens();
    await tokenMap.updateConfigByJson(tokens);
  }

  return tokenMap;
};
