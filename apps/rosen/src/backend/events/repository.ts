import { ObservationEntity } from '@rosen-bridge/observation-extractor';
import { BlockEntity } from '@rosen-bridge/scanner';
import {
  Filters,
  filtersToTypeorm,
} from '@rosen-bridge/ui-kit/dist/components/common/smartSearch/server';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';
import { Network } from '@rosen-ui/types';

import { getTokenMap } from '@/tokenMap/getServerTokenMap';

import { dataSource } from '../dataSource';
import '../initialize-datasource-if-needed';

const blockRepository = dataSource.getRepository(BlockEntity);
const eventTriggerRepository = dataSource.getRepository(EventTriggerEntity);
const observationRepository = dataSource.getRepository(ObservationEntity);

interface EventWithTotal
  extends Omit<ObservationEntity, 'requestId'>,
    Pick<EventTriggerEntity, 'WIDsCount' | 'paymentTxId' | 'spendTxId'> {
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

  let { pagination, query, sort } = filtersToTypeorm(
    filters,
    (key) => `sub."${key}"`,
  );

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
      'COALESCE(ete."WIDsCount", 0) AS "WIDsCount"',
      'ete.paymentTxId AS "paymentTxId"',
      'ete.spendTxId AS "spendTxId"',
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

  const items = rawItems.map(({ total, ...item }) => item);

  return {
    items,
    total: rawItems[0]?.total ?? 0,
  };
};

export const getEventById = async (eventId: string) => {
  const qb = observationRepository
    .createQueryBuilder('obs')
    .leftJoin(BlockEntity, 'block', 'block.hash = obs.block')
    .leftJoin(EventTriggerEntity, 'et', 'et.eventId = obs.requestId')
    .select([
      'obs.id AS "id"',
      'obs.fromChain AS "fromChain"',
      'obs.toChain AS "toChain"',
      'obs.fromAddress AS "fromAddress"',
      'obs.toAddress AS "toAddress"',
      'obs.height AS "height"',
      'obs.amount AS "amount"',
      'obs.networkFee AS "networkFee"',
      'obs.bridgeFee AS "bridgeFee"',
      'obs.sourceChainTokenId AS "sourceChainTokenId"',
      'obs.targetChainTokenId AS "targetChainTokenId"',
      'obs.sourceTxId AS "sourceTxId"',
      'obs.sourceBlockId AS "sourceBlockId"',
      'obs.requestId AS "eventId"',

      'block.timestamp AS "timestamp"',
      'block.hash AS "blockHash"',
      'block.height AS "blockHeight"',

      'et.WIDsCount AS "WIDsCount"',
      'et.paymentTxId AS "paymentTxId"',
      'et.spendTxId AS "spendTxId"',
      'et.result AS "triggerResult"',
      'et.txId AS "triggerTxId"',
      'et.fromChain AS "triggerFromChain"',
      'et.toChain AS "triggerToChain"',
      'et.fromAddress AS "triggerFromAddress"',
      'et.toAddress AS "triggerToAddress"',
    ])

    .addSelect(
      `COALESCE(
        FIRST_VALUE(et.result) OVER(PARTITION BY et.eventId ORDER BY COALESCE(et.result, 'PROCESSING') DESC),
        'PROCESSING'
      )`,
      'status',
    )
    .where('obs.requestId = :eventId', { eventId });

  // console.log(qb.getSql());
  const result = await qb.getRawOne();

  if (!result) return null;

  return {
    id: result.id,
    eventId: result.eventId,
    fromChain: result.fromChain,
    toChain: result.toChain,
    fromAddress: result.fromAddress,
    toAddress: result.toAddress,
    height: result.height,
    amount: result.amount,
    networkFee: result.networkFee,
    bridgeFee: result.bridgeFee,
    sourceChainTokenId: result.sourceChainTokenId,
    targetChainTokenId: result.targetChainTokenId,
    sourceTxId: result.sourceTxId,
    sourceBlockId: result.sourceBlockId,

    block: {
      hash: result.blockHash,
      height: result.blockHeight,
      timestamp: result.timestamp,
    },

    eventTrigger: {
      txId: result.triggerTxId,
      paymentTxId: result.paymentTxId,
      spendTxId: result.spendTxId,
      WIDsCount: result.WIDsCount,
      result: result.triggerResult,
    },

    status: result.status,
  };
};
