import { TokenMap } from '@rosen-bridge/tokens';
import { Filters } from '@rosen-bridge/ui-kit/dist/components/common/smartSearch/server';
import { Network } from '@rosen-ui/types';

import { getTokenMap } from '@/tokenMap/getServerTokenMap';

import { UNSUPPORTED_TOKEN_NAME } from '../constants';
import { getEvents } from './repository';

/**
 * get full token data associated with a tokenId and a chain
 * @param tokenMap
 * @param tokenId
 * @param chain
 */
const getFullTokenData = (
  tokenMap: TokenMap,
  tokenId: string,
  chain: Network,
) => {
  try {
    const token = tokenMap.search(chain, { tokenId });

    return {
      tokenId: tokenId,
      name: token[0]?.[chain].name ?? UNSUPPORTED_TOKEN_NAME,
      significantDecimals: tokenMap.getSignificantDecimals(tokenId) || 0,
      isNativeToken: token[0]?.[chain].type === 'native',
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
 * @param filters
 */
export const getEventsWithFullTokenData = async (filters: Filters) => {
  const tokenMap = await getTokenMap();

  const events = await getEvents(filters);

  return {
    total: events.total,
    items: events.items.map(({ sourceChainTokenId, ...item }) => ({
      ...item,
      lockToken: getFullTokenData(tokenMap, sourceChainTokenId, item.fromChain),
    })),
  };
};
