import {
  Filters,
  filtersToTypeorm,
} from '@rosen-bridge/ui-kit/dist/components/common/smartSearch/server';
import { EventViewEntity } from '@rosen-ui/asset-calculator';

import { getTokenMap } from '@/tokenMap/getServerTokenMap';

import { dataSource } from '../dataSource';
import '../initialize-datasource-if-needed';

const eventViewRepository = dataSource.getRepository(EventViewEntity);

/**
 * get paginated list of events
 * @param filters
 */
export const getEvents = async (filters: Filters) => {
  const tokenMap = await getTokenMap();

  if (filters.search) {
    filters.search.in ||= [];
  }

  if (!filters.sorts.length) {
    filters.sorts.push({
      key: 'timestamp',
      order: 'DESC',
    });
  }

  (() => {
    const field = filters.fields?.find(
      (field) => field.key == 'sourceChainTokenId',
    );

    if (!field) return;

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
  })();

  const options = filtersToTypeorm<EventViewEntity>(filters);

  // queryBuilder = queryBuilder
  // .distinctOn(['sub."eventId"'])
  // .orderBy('sub."eventId"', 'ASC');

  const [items, total] = await eventViewRepository.findAndCount(options);

  return {
    items,
    total,
  };
};
