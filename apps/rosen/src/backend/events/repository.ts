import { ObservationEntity } from '@rosen-bridge/abstract-observation-extractor';
import { BlockEntity } from '@rosen-bridge/abstract-scanner';
import { In } from '@rosen-bridge/extended-typeorm';
import { TokenPriceAction } from '@rosen-bridge/token-price-entity';
import {
  Filters,
  filtersToTypeorm,
} from '@rosen-bridge/ui-kit/dist/components/common/smartSearch/server';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';
import { TokenEntity } from '@rosen-ui/asset-calculator';
import {
  AggregatedStatusChangedEntity,
  AggregatedStatusEntity,
  AggregateEventStatus,
  AggregateTxStatus,
} from '@rosen-ui/public-status';
import { Network } from '@rosen-ui/types';

import { dataSource } from '../dataSource';
import '../initialize-datasource-if-needed';

const tokenPriceAction = new TokenPriceAction(dataSource);

const blockRepository = dataSource.getRepository(BlockEntity);
const eventTriggerRepository = dataSource.getRepository(EventTriggerEntity);
const observationRepository = dataSource.getRepository(ObservationEntity);
const tokenRepository = dataSource.getRepository(TokenEntity);
const aggregatedStatusRepository = dataSource.getRepository(
  AggregatedStatusEntity,
);
const aggregatedStatusChangedRepository = dataSource.getRepository(
  AggregatedStatusChangedEntity,
);

interface EventWithTotal
  extends Omit<ObservationEntity, 'requestId'>,
    Pick<EventTriggerEntity, 'WIDsCount' | 'paymentTxId' | 'spendTxId'> {
  eventId: string;
  eventTriggerId: string;
  timestamp: number;
  total: number;
  flows: number;
  status: 'fraud' | 'processing' | 'successful' | 'multipleFlows';
  fromChain: Network;
  toChain: Network;
  lockToken?: TokenEntity;
}

type EventDetailsType = Omit<EventWithTotal, 'status' | 'total'> & {
  status:
    | 'COMPLETED'
    | 'CREATED'
    | 'FRAUD'
    | 'MULTIPLE_FLOWS'
    | 'PAID'
    | 'PAYMENT_APPROVED'
    | 'PAYMENT_SENT'
    | 'PAYMENT_SIGNED'
    | 'PAYMENT_SIGNING'
    | 'PAYMENT_STALLED'
    | 'REACHED_LIMIT'
    | 'REJECTED'
    | 'REWARD_APPROVED'
    | 'REWARD_SENT'
    | 'REWARD_SIGNED'
    | 'REWARD_SIGNING'
    | 'REWARD_STALLED'
    | 'TIMEOUT'
    | 'TRIGGERED'
    | 'UNKNOWN';
  timestamps: Partial<Record<EventDetailsType['status'], number>>;
};

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

  await (async () => {
    const field = filters.fields?.find(
      (field) => field.key == 'originalTokenId',
    );

    if (!field) return;

    field.key = 'sourceChainTokenId';

    const originalTokenIds = [field.value].flat();

    const originalTokens = await tokenRepository.find({
      where: {
        id: In(originalTokenIds),
      },
    });

    const originalErgoSideTokenIds = originalTokens.map(
      (token) => token.ergoSideTokenId,
    );

    const ergoSideTokens = await tokenRepository.find({
      select: ['id'],
      where: {
        ergoSideTokenId: In(originalErgoSideTokenIds),
      },
    });

    const ergoSideTokenIds = ergoSideTokens.map((token) => token.id);

    field.value = ergoSideTokenIds;
  })();

  const statusIndex =
    filters.fields?.findIndex((field) => field.key == 'status') ?? -1;

  const status =
    statusIndex > -1 ? filters.fields?.splice(statusIndex, 1)[0] : undefined;

  let { pagination, query, sort } = filtersToTypeorm(filters, (key) => {
    switch (key) {
      case 'amount':
      case 'bridgeFee':
      case 'networkFee':
        return `sub."${key}Normalized"`;
      default:
        return `sub."${key}"`;
    }
  });

  if (status) {
    query = `${query ? `${query} AND ` : ''}(${status.operator == '!=' ? 'NOT ' : ''}('${status.value}' = ANY(sub."statuses")))`;
  }

  const subquery = observationRepository
    .createQueryBuilder('oe')
    .leftJoin(blockRepository.metadata.tableName, 'be', 'be.hash = oe.block')
    .leftJoin(
      eventTriggerRepository.metadata.tableName,
      'ete',
      'ete.eventId = oe.requestId',
    )
    .leftJoin(
      tokenRepository.metadata.tableName,
      'te',
      'te.id = oe.sourceChainTokenId',
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
      'ete.id AS "eventTriggerId"',
      'to_jsonb(te) AS "lockToken"',
      'COALESCE(ete.result, \'processing\') AS "status"',
      '(CAST(oe.amount AS DOUBLE PRECISION) / POWER(10, COALESCE(te.significantDecimal, 0))) AS "amountNormalized"',
      '(CAST(oe.networkFee AS DOUBLE PRECISION) / POWER(10, COALESCE(te.significantDecimal, 0))) AS "networkFeeNormalized"',
      '(CAST(oe.bridgeFee AS DOUBLE PRECISION) / POWER(10, COALESCE(te.significantDecimal, 0))) AS "bridgeFeeNormalized"',
      'COUNT(ete.id) OVER (PARTITION BY oe.id) AS "flows"',
      'ARRAY_AGG(COALESCE(ete.result, \'processing\')) OVER (PARTITION BY oe.id) AS "statuses"',
    ])
    .orderBy('oe.id')
    .addOrderBy(
      `COALESCE(array_position(ARRAY['successful', 'processing', '', 'fraud'], ete.result), 3)`,
      'ASC',
    )
    .addOrderBy(`be.timestamp`, 'ASC')
    .distinctOn(['oe.id']);

  let queryBuilder = dataSource
    .createQueryBuilder()
    .select(['sub.*', 'COUNT(*) OVER() AS "total"'])
    .from(`(${subquery.getQuery()})`, 'sub')
    .setParameters(subquery.getParameters());

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const items = rawItems.map(({ total, ...item }) => item);

  return {
    items: items.map((item) => ({
      ...item,
      status: item.flows > 1 ? 'multipleFlows' : item.status,
    })),
    total: rawItems[0]?.total ?? 0,
  };
};

export const getEvent = async (id: string) => {
  const event = await dataSource
    .getRepository(ObservationEntity)
    .createQueryBuilder('oe')
    .leftJoin(BlockEntity, 'be', 'be.hash = oe.block')
    .leftJoin(EventTriggerEntity, 'ete', 'ete.eventId = oe.requestId')
    .leftJoin(TokenEntity, 'te', 'te.id = oe.sourceChainTokenId')
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
      'to_jsonb(te) AS "lockToken"',
    ])
    .where('oe.requestId = :id', { id })
    .getRawOne<EventDetailsType>();

  if (!event || !event.lockToken) throw new Error(`Not found`);

  const token = await tokenRepository.findOne({
    where: {
      isResident: true,
      ergoSideTokenId: event.lockToken.ergoSideTokenId,
    },
  });

  if (!token) throw new Error(`Not found`);

  const price = await tokenPriceAction.getLatestTokenPrice(
    token.id,
    event.timestamp,
  );

  const { status, timestamps } = await getEventStatus(id);
  event.status = status;
  event.timestamps = timestamps;

  return {
    ...event,
    price,
  };
};

const getEventStatus = async (
  eventId: string,
): Promise<{
  status: EventDetailsType['status'];
  timestamps: Partial<Record<EventDetailsType['status'], number>>;
}> => {
  const result = {
    status: 'CREATED' as EventDetailsType['status'],
    timestamps: {} as Partial<Record<EventDetailsType['status'], number>>,
  };

  const observation = await observationRepository.findOneBy({
    requestId: eventId,
  });

  if (!observation) {
    throw new Error('TODO');
  }

  // timestamp: be.timestamp which is fetched from query: observation_entity as oe join block_entity as be on oe.sourceBlockid == be.hash (exactly one record)
  const block = await blockRepository.findOneByOrFail({
    hash: observation.sourceBlockId,
  });
  result.status = 'CREATED';
  result.timestamps['CREATED'] = block.timestamp;

  const eventTrigger = await eventTriggerRepository.findOneBy({
    eventId: eventId,
  });

  if (!eventTrigger) return result;

  if (eventTrigger.result === 'fraud') {
    result.status = 'FRAUD';
    if (eventTrigger.spendBlock) {
      result.timestamps['FRAUD'] = (
        await blockRepository.findOneBy({ hash: eventTrigger.spendBlock })
      )?.timestamp;
    }
  }

  if (eventTrigger.result === 'successful') {
    result.status = 'COMPLETED';
    if (eventTrigger.spendBlock) {
      result.timestamps['COMPLETED'] = (
        await blockRepository.findOneBy({ hash: eventTrigger.spendBlock })
      )?.timestamp;
    }
  }

  // timestamp: be.timestamp which is fetched from query: event_trigger_entity as ete join block_entity as be on ete.block == be.hash (exactly one record)
  if (eventTrigger) {
    result.timestamps['TRIGGERED'] = (
      await blockRepository.findOneBy({ hash: eventTrigger.block })
    )?.timestamp;
  }

  const aggregatedStatusChangedItems =
    await aggregatedStatusChangedRepository.find({
      where: { eventId: eventId },
      order: { insertedAt: 'DESC' },
    });

  // TODO
  if (eventTrigger.result === null) {
    const aggregatedStatus = await aggregatedStatusRepository.findOneBy({
      eventId: eventId,
    });

    switch (aggregatedStatus?.status) {
      case null:
      case AggregateEventStatus.pendingPayment:
      case AggregateEventStatus.waitingForConfirmation:
        result.status = 'TRIGGERED';
        break;

      case AggregateEventStatus.finished:
        result.status = 'COMPLETED';
        break;

      case AggregateEventStatus.paymentWaiting:
        result.status = 'PAYMENT_STALLED';
        break;

      case AggregateEventStatus.pendingReward:
        result.status = 'PAID';
        break;

      case AggregateEventStatus.reachedLimit:
        result.status = 'REACHED_LIMIT';
        break;

      case AggregateEventStatus.rejected:
        result.status = 'REJECTED';
        break;

      case AggregateEventStatus.rewardWaiting:
        result.status = 'REWARD_STALLED';
        break;

      case AggregateEventStatus.timeout:
        result.status = 'TIMEOUT';
        break;

      case AggregateEventStatus.inPayment:
        switch (aggregatedStatus.txStatus) {
          case AggregateTxStatus.completed:
            result.status = 'PAID';
            break;

          case AggregateTxStatus.inSign:
            result.status = 'PAYMENT_SIGNING';
            break;

          case AggregateTxStatus.sent:
            result.status = 'PAYMENT_SENT';
            break;

          case AggregateTxStatus.signed:
            result.status = 'PAYMENT_SIGNED';
            break;

          default:
            result.status = 'PAYMENT_APPROVED';
            break;
        }
        break;

      case AggregateEventStatus.inReward:
        switch (aggregatedStatus.txStatus) {
          case AggregateTxStatus.inSign:
            result.status = 'REWARD_SIGNING';
            break;

          case AggregateTxStatus.sent:
            result.status = 'REWARD_SENT';
            break;

          case AggregateTxStatus.signed:
            result.status = 'REWARD_SIGNED';
            break;

          default:
            result.status = 'REWARD_APPROVED';
            break;
        }
        break;
    }
  }

  const aaa = (status: AggregateEventStatus, txStatus?: AggregateTxStatus) => {
    return aggregatedStatusChangedItems.find(
      (item) =>
        item.status === status &&
        (txStatus ? item.txStatus === txStatus : true),
    )?.insertedAt;
  };

  // timestamp: `asce.insertedAt` which is fetched from query: `aggregated_status_changed_entity` as `asce` where `asce.status` == `in-payment` and `asce.txStatus` == `approved` (last record based on `insertedAt`)
  result.timestamps['PAYMENT_APPROVED'] = aaa(
    AggregateEventStatus.inPayment,
    AggregateTxStatus.inSign,
  );

  // timestamp: `asce.insertedAt` which is fetched from query: `aggregated_status_changed_entity` as `asce` where `asce.status` == `in-payment` and `asce.txStatus` == `signed` (last record based on `insertedAt`)
  result.timestamps['PAYMENT_SIGNED'] = aaa(
    AggregateEventStatus.inPayment,
    AggregateTxStatus.signed,
  );

  // timestamp: `asce.insertedAt` which is fetched from query: `aggregated_status_changed_entity` as `asce` where `asce.status` == `in-payment` and `asce.txStatus` == `sent` (last record based on `insertedAt`)
  result.timestamps['PAYMENT_SENT'] = aaa(
    AggregateEventStatus.inPayment,
    AggregateTxStatus.sent,
  );

  // timestamp: `asce.insertedAt` which is fetched from query: `aggregated_status_changed_entity` as `asce` where `asce.status` == `in-payment` and `asce.txStatus` == `sent` (last record based on `insertedAt`)
  result.timestamps['PAID'] = aaa(
    AggregateEventStatus.inPayment,
    AggregateTxStatus.sent,
  );

  // - ✅ Paid
  //     - confirmedAt: one of the following:
  //         - if target chain is NOT Ergo: `asce.insertedAt` which is fetched from query: `aggregated_status_changed_entity` as `asce` where `asce.status` == `pending-reward` (first record based on `insertedAt`)
  //         - else: `asce.insertedAt` which is fetched from query: `aggregated_status_changed_entity` as `asce` where `asce.status` == `finished` (exactly one record)

  // timestamp: `asce.insertedAt` which is fetched from query: `aggregated_status_changed_entity` as `asce` where `asce.status` == `in-reward` and `asce.txStatus` == `approved` (last record based on `insertedAt`)
  result.timestamps['REWARD_APPROVED'] = aaa(
    AggregateEventStatus.inReward,
    AggregateTxStatus.inSign,
  );

  // timestamp: `asce.insertedAt` which is fetched from query: `aggregated_status_changed_entity` as `asce` where `asce.status` == `in-reward` and `asce.txStatus` == `signed` (last record based on `insertedAt`)
  result.timestamps['REWARD_SIGNED'] = aaa(
    AggregateEventStatus.inReward,
    AggregateTxStatus.signed,
  );

  // timestamp: `asce.insertedAt` which is fetched from query: `aggregated_status_changed_entity` as `asce` where `asce.status` == `in-reward` and `asce.txStatus` == `sent` (last record based on `insertedAt`)
  result.timestamps['REWARD_SENT'] = aaa(
    AggregateEventStatus.inReward,
    AggregateTxStatus.sent,
  );

  // ✅ Rewarded
  // timestamp: `be.timestamp` which is fetched from query: `event_trigger_entity` as `ete` join `block_entity` as `be` on `ete.spendBlock` == `be.hash` (exactly one record)
  // if (eventTrigger.spendBlock && eventTrigger.result === 'successful') {
  //   result.statusDetails['COMPLETED'] = (await blockRepository.findOneBy({ hash: eventTrigger.spendBlock }))?.timestamp;
  // }

  // timestamp: `asce.insertedAt` which is fetched from query: `aggregated_status_changed_entity` as `asce` where `asce.status` == `rejected` (last record based on `insertedAt`)
  result.timestamps['REJECTED'] = aaa(AggregateEventStatus.rejected);

  // timestamp: `asce.insertedAt` which is fetched from query: `aggregated_status_changed_entity` as `asce` where `asce.status` == `reached-limit` (last record based on `insertedAt`)
  result.timestamps['REACHED_LIMIT'] = aaa(AggregateEventStatus.reachedLimit);

  // timestamp: `asce.insertedAt` which is fetched from query: `aggregated_status_changed_entity` as `asce` where `asce.status` == `timeout` (last record based on `insertedAt`)
  result.timestamps['TIMEOUT'] = aaa(AggregateEventStatus.timeout);

  return result;
};
