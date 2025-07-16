import { ObservationEntity } from '@rosen-bridge/observation-extractor';
import { BlockEntity } from '@rosen-bridge/scanner';
import {
  Filters,
  filtersToTypeorm,
} from '@rosen-bridge/ui-kit/dist/components/common/smartSearch/server';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';
import { Network } from '@rosen-ui/types';

import { dataSource } from '../dataSource';
import '../initialize-datasource-if-needed';

const blockRepository = dataSource.getRepository(BlockEntity);
const eventTriggerRepository = dataSource.getRepository(EventTriggerEntity);
const observationRepository = dataSource.getRepository(ObservationEntity);

interface EventWithTotal extends Omit<ObservationEntity, 'requestId'> {
  eventId: string;
  timestamp: number;
  total: number;
  status: 'fraud' | 'processing' | 'successful';
  fromChain: Network;
  toChain: Network;
}

/**
 * get paginated list of events
 * @param offset
 * @param limit
 */
export const getEvents = async (filters: Filters) => {
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

  let { pagination, query, sort } = filtersToTypeorm(filters, (key) => {
    switch (key) {
      case 'amount':
      case 'bridgeFee':
      case 'networkFee':
        return `CAST(sub.${key} AS BIGINT)`;
      case 'source':
        return 'sub.sourceTxId';
      default:
        return `sub.${key}`;
    }
  });

  const subquery = observationRepository
    .createQueryBuilder('oe')
    .leftJoin(blockRepository.metadata.tableName, 'be', 'be.hash = oe.block')
    .leftJoin(
      eventTriggerRepository.metadata.tableName,
      'ete',
      'ete.eventId = oe.requestId',
    )
    .select([
      'oe.id AS "id"',
      'oe.fromChain AS "fromChain"',
      'oe.toChain AS "toChain"',
      'oe.fromAddress AS "fromAddress"',
      'oe.toAddress AS "toAddress"',
      'oe.height AS "height"',
      'oe.amount AS "amount"',
      'oe.networkFee AS "networkFee"',
      'oe.bridgeFee AS "bridgeFee"',
      'oe.sourceChainTokenId AS "sourceChainTokenId"',
      'oe.sourceTxId AS "sourceTxId"',
      'oe.requestId AS "eventId"',
      'be.timestamp AS "timestamp"',
      'COUNT(*) OVER() AS "total"',
      /**
       * There may be multiple event triggers for the same events, but we should
       * only select one based on the results. The order is:
       *
       * 1. "successful": If there is at least one successful one, no matter the
       *  other event trigger results, the event can be counted as successful
       * 2. NULL (coalesced to "processing" for sql sorting purposes): If no
       *  successful event triggers exists and at least one processing one, the
       *  event may still become successful
       * 3. "fraud": If only fraud event triggers exists, it's clear that the
       *  event is a fraud
       */
      "COALESCE(FIRST_VALUE(ete.result) OVER(PARTITION BY ete.eventId ORDER BY COALESCE(ete.result, 'processing') DESC), 'processing') AS status",
    ]);

  let queryBuilder = dataSource
    .createQueryBuilder()
    .select('*')
    .from(`(${subquery.getQuery()})`, 'sub');

  if (query) {
    queryBuilder = queryBuilder.where(query);
  }

  queryBuilder = queryBuilder.distinct(true);

  if (sort) {
    queryBuilder = queryBuilder.orderBy(sort.key, sort.order);
  }

  if (pagination?.offset) {
    queryBuilder = queryBuilder.offset(pagination.offset);
  }

  if (pagination?.limit) {
    queryBuilder = queryBuilder.limit(pagination.limit);
  }

  /**
   * TODO: convert the query to a view
   * local:ergo/rosen-bridge/ui#194
   */
  const rawItems = await queryBuilder.getRawMany<EventWithTotal>();

  const items = rawItems.map(({ total, ...item }) => item);

  return {
    items,
    total: rawItems[0]?.total ?? 0,
  };
};
