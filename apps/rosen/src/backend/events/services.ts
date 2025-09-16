import { TokenMap } from '@rosen-bridge/tokens';
import { Filters } from '@rosen-bridge/ui-kit/dist/components/common/smartSearch/server';
import { Network } from '@rosen-ui/types';

import {
  EventDetailsV2,
  RosenChainTokenV2,
  TokenCollectionV2,
  TokenInfoV2,
} from '@/app/events/[details]/type';
import { getTokenMap } from '@/tokenMap/getServerTokenMap';

import { UNSUPPORTED_TOKEN_NAME } from '../constants';
import {
  getEventByIdRepo,
  getEvents,
  getMetadataRepo,
  getProcessRepo,
  getWatchersRepo,
} from './repository';

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

/**
 * Get single event buy id
 * @param eventId
 */
export const getEventByIdService = async (eventId: string) => {
  const result = await getEventByIdRepo(eventId);
  if (!result) throw new Error(`Event with id ${eventId} not found`);

  const tokenMap = await getTokenMap();
  const collections = tokenMap.getConfig();

  const findTokenInfo = (tokenId: string) => {
    for (const collection of collections) {
      for (const token of Object.values(collection)) {
        const t = token as RosenChainTokenV2;
        if (t.tokenId === tokenId) {
          return {
            tokenId: t.tokenId,
            name: t.name ?? '',
            symbol: t.symbol ?? '',
            decimals: t.decimals ?? 0,
          };
        }
      }
    }

    return null;
  };

  return {
    ...result,
    totalFee: (Number(result.bridgeFee) + Number(result.networkFee)).toString(),
    height: Number(result.height),
    WIDsCount: Number(result.WIDsCount),
    sourceToken: findTokenInfo(result.sourceChainTokenId),
    targetToken: findTokenInfo(result.targetChainTokenId),
  };
};

/**
 * Get getEventWatchersService
 * @param eventId
 */
export const getEventWatchersService = async (eventId: string) => {
  const result = await getWatchersRepo(eventId);

  return {
    ...result,
  };
};

/**
 * Get getEventWatchers
 * @param eventId
 */
export const getEventProcessService = async (eventId: string) => {
  const result = await getProcessRepo(eventId);

  return {
    ...result,
  };
};

/**
 * Get getEventWatchers
 * @param eventId
 */
export const getEventMetadataService = async (eventId: string) => {
  const result = await getMetadataRepo(eventId);

  return result;
};
