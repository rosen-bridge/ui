import { TokenMap } from '@rosen-bridge/tokens';

import { getRosenTokens } from '@/_backend/utils';

import { getEvents } from './event-repository';

import { UNSUPPORTED_TOKEN_NAME } from '../constants';

const tokenMap = new TokenMap(getRosenTokens());

/**
 * get full token data associated with a tokenId and a chain
 * @param tokenId
 * @param chain
 */
const getFullTokenData = (tokenId: string, chain: string) => {
  try {
    const token = tokenMap.search(chain, {
      [tokenMap.getIdKey(chain)]: tokenId,
    });

    return {
      tokenId: tokenId,
      name: token[0]?.[chain].name ?? UNSUPPORTED_TOKEN_NAME,
      decimals: token[0]?.[chain].decimals ?? 0,
      isNativeToken: token[0]?.[chain].metaData.type === 'native',
    };
  } catch {
    return {
      tokenId: tokenId,
      name: UNSUPPORTED_TOKEN_NAME,
      decimals: 0,
      isNativeToken: false,
    };
  }
};

/**
 * return events with full token data
 * @param offset
 * @param limit
 */
const getEventsWithFullTokenData = async (offset: number, limit: number) => {
  const events = await getEvents(offset, limit);

  return {
    total: events.total,
    items: events.items.map(({ sourceChainTokenId, ...item }) => ({
      ...item,
      lockToken: getFullTokenData(sourceChainTokenId, item.fromChain),
    })),
  };
};

const eventService = {
  getEventsWithFullTokenData,
};

export default eventService;
