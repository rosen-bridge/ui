import { TokenMap } from '@rosen-bridge/tokens';
import { Network } from '@rosen-ui/types';

import { getRosenTokens } from '@/_backend/utils';

import { UNSUPPORTED_TOKEN_NAME } from '../constants';
import { getEvents } from './repository';

const tokenMap = new TokenMap(getRosenTokens());

/**
 * get full token data associated with a tokenId and a chain
 * @param tokenId
 * @param chain
 */
const getFullTokenData = (tokenId: string, chain: Network) => {
  try {
    const token = tokenMap.search(chain, {
      [tokenMap.getIdKey(chain)]: tokenId,
    });

    return {
      tokenId: tokenId,
      name: token[0]?.[chain].name ?? UNSUPPORTED_TOKEN_NAME,
      significantDecimals: tokenMap.getSignificantDecimals(tokenId) || 0,
      isNativeToken: token[0]?.[chain].metaData.type === 'native',
    };
  } catch {
    return {
      tokenId: tokenId,
      name: UNSUPPORTED_TOKEN_NAME,
      significantDecimals: 0,
      isNativeToken: false,
    };
  }
};

/**
 * return events with full token data
 * @param offset
 * @param limit
 */
export const getEventsWithFullTokenData = async (
  offset: number,
  limit: number,
) => {
  const events = await getEvents(offset, limit);

  return {
    total: events.total,
    items: events.items.map(({ sourceChainTokenId, ...item }) => ({
      ...item,
      lockToken: getFullTokenData(sourceChainTokenId, item.fromChain),
    })),
  };
};
