import { TokenMap } from '@rosen-bridge/tokens';
import { Filter } from '@rosen-bridge/ui-kit/dist/components/common/smartSearch/server';
import { Network } from '@rosen-ui/types';

import { getTokenMap } from '@/tokenMap/getServerTokenMap';

import { UNSUPPORTED_TOKEN_NAME } from '../constants';
import { getEvent, getEvents } from './repository';

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
 * @param filter
 */
export const getEventsWithFullTokenData = async (filter: Filter) => {
  const tokenMap = await getTokenMap();

  const events = await getEvents(filter);

  return {
    total: events.total,
    items: events.items.map(({ sourceChainTokenId, ...item }) => ({
      ...item,
      lockToken: getFullTokenData(tokenMap, sourceChainTokenId, item.fromChain),
    })),
  };
};

export const getEventById = async (id: string) => {
  const item = await getEvent(id);

  if (!item) throw new Error(`Not found`);

  const tokenMap = await getTokenMap();

  return {
    ...item,
    totalFee: (+item.bridgeFee + +item.networkFee).toString(),
    lockToken: getFullTokenData(
      tokenMap,
      item.sourceChainTokenId,
      item.fromChain,
    ),
  };
};
