import { TokenMap } from '@rosen-bridge/tokens';
import { Filters } from '@rosen-bridge/ui-kit/dist/components/common/smartSearch/server';
import { Network } from '@rosen-ui/types';

import { getTokenMap } from '@/tokenMap/getServerTokenMap';

import { UNSUPPORTED_TOKEN_NAME } from '../constants';
import { getEvent, getEvents, getWatchers } from './repository';

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

  filters.sort = Object.assign(
    {
      key: 'timestamp',
      order: 'DESC',
    },
    filters.sort,
  );

  if (filters.search) {
    filters.search.in ||= [];
  }

  const field = filters.fields?.find(
    (field) => field.key == 'sourceChainTokenId',
  );

  if (field) {
    const tokenIds: string[] = [];

    const values = [field.value].flat();

    const collections = tokenMap.getConfig();

    for (const collection of collections) {
      const tokens = Object.values(collection);
      for (const value of values) {
        for (const token of tokens) {
          if (token.tokenId !== value) continue;
          const ids = tokens.map((token) => token.tokenId);
          tokenIds.push(...ids);
          break;
        }
      }
    }

    field.value = tokenIds;
  }

  const events = await getEvents(filters);

  return {
    total: events.total,
    items: events.items.map(({ sourceChainTokenId, ...item }) => ({
      ...item,
      totalFee: (+item.bridgeFee + +item.networkFee).toString(),
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

export const getEventProcess = async (id: string) => {
  return {
    steps: [
      {
        id: `${crypto.randomUUID()}`,
        state: 'done',
        title: 'Created',
        subtitle: '18 Aug 2025 11:14:30',
        description: 'More description about this status goes here.',
        sub: [
          {
            id: `${crypto.randomUUID()}`,
            state: 'done',
            title: 'Tx Approved',
            subtitle: 'Tx Approved',
          },
          {
            id: `${crypto.randomUUID()}`,
            state: 'done',
            title: 'Tx Approved',
            subtitle: 'Tx Approved',
          },
          {
            id: `${crypto.randomUUID()}`,
            state: 'done',
            title: 'Tx Approved',
            subtitle: 'Tx Approved',
          },
        ],
      },
      {
        id: `${crypto.randomUUID()}`,
        state: 'done',
        title: 'Committed',
        subtitle: '18 Aug 2025 11:14:30',
        description: 'More description about this status goes here.',
        sub: [
          {
            id: `${crypto.randomUUID()}`,
            state: 'done',
            title: 'Tx Apstepproved',
            subtitle: 'Tx Approved',
          },
          {
            id: `${crypto.randomUUID()}`,
            state: 'done',
            title: 'Tx Approved',
            subtitle: 'Tx Approved',
          },
          {
            id: `${crypto.randomUUID()}`,
            state: 'done',
            title: 'Tx Approved',
            subtitle: 'Tx Approved',
          },
        ],
      },
      {
        id: `${crypto.randomUUID()}`,
        state: 'pending',
        title: 'Triggered',
        subtitle: '18 Aug 2025 11:14:30',
        description: 'More description about this status goes here.',
        sub: [
          {
            id: `${crypto.randomUUID()}`,
            state: 'done',
            title: 'Approved',
            subtitle: '',
          },
          {
            id: `${crypto.randomUUID()}`,
            state: 'pending',
            title: 'Sign',
            subtitle: '',
          },
          {
            id: `${crypto.randomUUID()}`,
            state: 'idle',
            title: 'Send',
            subtitle: '',
          },
        ],
      },
      {
        id: `${crypto.randomUUID()}`,
        state: 'idle',
        title: 'Tx Created',
        subtitle: '18 Aug 2025 11:14:30',
        description: 'More description about this status goes here.',
        sub: [
          {
            id: `${crypto.randomUUID()}`,
            state: 'idle',
            title: 'Tx Approved',
            subtitle: 'Tx Approved',
          },
          {
            id: `${crypto.randomUUID()}`,
            state: 'idle',
            title: 'Tx Approved',
            subtitle: 'Tx Approved',
          },
          {
            id: `${crypto.randomUUID()}`,
            state: 'idle',
            title: 'Tx Approved',
            subtitle: 'Tx Approved',
          },
        ],
      },
      {
        id: `${crypto.randomUUID()}`,
        state: 'idle',
        title: 'In Payment',
        subtitle: '18 Aug 2025 11:14:30',
        description: 'More description about this status goes here.',
        sub: [
          {
            id: `${crypto.randomUUID()}`,
            state: 'idle',
            title: 'Tx Approved',
            subtitle: 'Tx Approved',
          },
          {
            id: `${crypto.randomUUID()}`,
            state: 'idle',
            title: 'Tx Approved',
            subtitle: 'Tx Approved',
          },
          {
            id: `${crypto.randomUUID()}`,
            state: 'idle',
            title: 'Tx Approved',
            subtitle: 'Tx Approved',
          },
        ],
      },
      {
        id: `${crypto.randomUUID()}`,
        state: 'idle',
        title: 'Reward',
        subtitle: '18 Aug 2025 11:14:30',
        description: 'More description about this status goes here.',
        sub: [
          {
            id: `${crypto.randomUUID()}`,
            state: 'idle',
            title: 'Tx Approved',
            subtitle: 'Tx Approved',
          },
          {
            id: `${crypto.randomUUID()}`,
            state: 'idle',
            title: 'Tx Approved',
            subtitle: 'Tx Approved',
          },
          {
            id: `${crypto.randomUUID()}`,
            state: 'idle',
            title: 'Tx Approved',
            subtitle: 'Tx Approved',
          },
        ],
      },
      {
        id: `${crypto.randomUUID()}`,
        state: 'idle',
        title: 'Completion',
        subtitle: '18 Aug 2025 11:14:30',
        description: 'More description about this status goes here.',
        sub: [
          {
            id: `${crypto.randomUUID()}`,
            state: 'idle',
            title: 'Tx Approved',
            subtitle: 'Tx Approved',
          },
          {
            id: `${crypto.randomUUID()}`,
            state: 'idle',
            title: 'Tx Approved',
            subtitle: 'Tx Approved',
          },
          {
            id: `${crypto.randomUUID()}`,
            state: 'idle',
            title: 'Tx Approved',
            subtitle: 'Tx Approved',
          },
        ],
      },
    ],
  };
};

export const getEventWatchers = async (id: string) => {
  const item = await getWatchers(id);

  if (!item) throw new Error(`Not found`);

  return item;
};

export const getEventMetadata = async (id: string) => {
  return 'TODO';
};
