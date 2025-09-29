import { ObservationEntity } from '@rosen-bridge/abstract-observation-extractor';
import { BlockEntity } from '@rosen-bridge/abstract-scanner';
import {
  Filters,
  filtersToTypeorm,
} from '@rosen-bridge/ui-kit/dist/components/common/smartSearch/server';
import {
  CommitmentEntity,
  EventTriggerEntity,
} from '@rosen-bridge/watcher-data-extractor';
import { Network } from '@rosen-ui/types';

import { dataSource } from '../dataSource';
import '../initialize-datasource-if-needed';

interface EventWithTotal
  extends Omit<ObservationEntity, 'requestId'>,
    Pick<
      EventTriggerEntity,
      'WIDsCount' | 'paymentTxId' | 'spendTxId' | 'txId'
    >,
    Pick<BlockEntity, 'timestamp'> {
  eventId: string;
  total: number;
  status: 'fraud' | 'processing' | 'successful';
  fromChain: Network;
  toChain: Network;
}

export const createSharedObservationQuery = () => {
  return dataSource
    .getRepository(ObservationEntity)
    .createQueryBuilder('oe')
    .leftJoin(BlockEntity, 'be', 'be.hash = oe.block')
    .leftJoin(EventTriggerEntity, 'ete', 'ete.eventId = oe.requestId')
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
      'COALESCE(ete."WIDsCount", 0) AS "WIDsCount"',
      'ete.paymentTxId AS "paymentTxId"',
      'ete.spendTxId AS "spendTxId"',
      'ete.txId AS "txId"',
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
};

/**
 * get paginated list of events
 * @param offset
 * @param limit
 */
export const getEvents = async (filters: Filters) => {
  let { pagination, query, sort } = filtersToTypeorm(
    filters,
    (key) => `sub."${key}"`,
  );

  const subquery = createSharedObservationQuery();

  let queryBuilder = dataSource
    .createQueryBuilder()
    .select(['sub.*', 'COUNT(*) OVER() AS "total"'])
    .from(`(${subquery.getQuery()})`, 'sub');

  if (query) {
    const keys = ['amount', 'bridgeFee', 'networkFee'];

    for (const key of keys) {
      query = query.replaceAll(`sub."${key}"`, `CAST(sub."${key}" AS BIGINT)`);
    }

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const items = rawItems.map(({ total, ...item }) => item);

  return {
    items,
    total: rawItems[0]?.total ?? 0,
  };
};

export const getEvent = async (id: string) => {
  return createSharedObservationQuery()
    .where('oe.requestId = :id', { id })
    .getRawOne<Omit<EventWithTotal, 'total'>>();
};

export const getWatchers = async (eventId: string) => {
  const event = await getEvent(eventId);

  if (!event) return;

  const triggeredBy = event.WIDsCount;

  const watchers = await dataSource
    .getRepository(CommitmentEntity)
    .createQueryBuilder('ce')
    .where('ce.eventId = :eventId', { eventId })
    .getMany();

  const commitments = watchers.filter(
    (item, index, items) => items.indexOf(item) === index,
  ).length;

  return {
    triggeredBy,
    commitments,
    rewardedTo: 0,
    watchers,
  };
};
