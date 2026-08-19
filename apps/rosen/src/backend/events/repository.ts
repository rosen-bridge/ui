import { ObservationEntity } from '@rosen-bridge/abstract-observation-extractor';
import { BlockEntity } from '@rosen-bridge/abstract-scanner';
import { ArrayContains, In, Not } from '@rosen-bridge/extended-typeorm';
import type { Filter, StringArrayFilterField } from '@rosen-bridge/query-params';
import { TokenPriceAction } from '@rosen-bridge/token-price-entity';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';
import { TokenEntity } from '@rosen-ui/asset-calculator';
import { NETWORKS } from '@rosen-ui/constants';
import {
  AggregatedStatusChangedEntity,
  AggregatedStatusEntity,
  AggregateEventStatus,
  AggregateTxStatus,
  EventStatusOverrideEntity,
  GuardStatusChangedEntity,
  GuardStatusEntity,
} from '@rosen-ui/public-status';
import type { Network } from '@rosen-ui/types';

import { filtersToTypeorm } from '@/filters';

import { dataSource } from '../dataSource';
import '../initialize-datasource-if-needed';

const tokenPriceAction = new TokenPriceAction(dataSource);

const blockRepository = dataSource.getRepository(BlockEntity);
const eventTriggerRepository = dataSource.getRepository(EventTriggerEntity);
const observationRepository = dataSource.getRepository(ObservationEntity);
const tokenRepository = dataSource.getRepository(TokenEntity);
const aggregatedStatusRepository = dataSource.getRepository(AggregatedStatusEntity);
const aggregatedStatusChangedRepository = dataSource.getRepository(AggregatedStatusChangedEntity);
const guardStatusRepository = dataSource.getRepository(GuardStatusEntity);
const guardStatusChangedRepository = dataSource.getRepository(GuardStatusChangedEntity);

type EventListItem = Omit<ObservationEntity, 'requestId'> &
  Pick<EventTriggerEntity, 'WIDsCount' | 'paymentTxId' | 'spendTxId'> & {
    eventId: string;
    eventTriggerId: number;
    timestamp: number;
    flows: number;
    status: EventStatusValue;
    fromChain: Network;
    toChain: Network;
    lockToken?: TokenEntity;
  };

type EventListItemWithTotal = {
  items: EventListItem[];
  total: number;
};

type EventStatus =
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
  | 'REWARDED'
  | 'REWARD_APPROVED'
  | 'REWARD_SENT'
  | 'REWARD_SIGNED'
  | 'REWARD_SIGNING'
  | 'REWARD_STALLED'
  | 'TIMEOUT'
  | 'TRIGGERED'
  | 'UNKNOWN'
  | 'processing';

type EventStatusOverride = {
  reason?: string;
  severity?: 'error' | 'info' | 'success' | 'warning';
  status: string;
};

type EventStatusValue = EventStatus | EventStatusOverride;

export type EventDetailsType = EventListItem & {
  txId: string;
  price?: number;
  totalFee: string;
};

export type EventStatusType = {
  status: EventStatus;
  timestamps: Partial<Record<EventStatus | 'PAID_CONFIRMED_AT_EXPERIMENTAL', number>>;
};

const toDatabaseStatus = (status: EventStatus): string => {
  switch (status) {
    case 'COMPLETED':
      return 'successful';
    case 'FRAUD':
      return 'fraud';
    default:
      return 'processing';
  }
};

const fromDatabaseStatus = (status: string): EventStatus => {
  switch (status) {
    case 'successful':
      return 'COMPLETED';
    case 'fraud':
      return 'FRAUD';
    default:
      return 'processing';
  }
};

/**
 * get paginated list of events
 * @param offset
 * @param limit
 */
export const getEvents = async (filters: Filter): Promise<EventListItemWithTotal> => {
  await (async () => {
    if (!filters.fields) return;

    const fieldIndex = filters.fields.findIndex((field) => field.key === 'originalTokenId');

    if (fieldIndex === -1) return;

    const field = filters.fields.at(fieldIndex);

    if (!field) return;

    if (field.operator !== 'equal' && field.operator !== 'notEqual') return;

    const originalTokenIds = [field.value].flat();

    const originalTokens = await tokenRepository.find({
      where: {
        id: In(originalTokenIds),
      },
    });

    const originalErgoSideTokenIds = originalTokens.map((token) => token.ergoSideTokenId);

    const ergoSideTokens = await tokenRepository.find({
      select: ['id'],
      where: {
        ergoSideTokenId: In(originalErgoSideTokenIds),
      },
    });

    const ergoSideTokenIds = ergoSideTokens.map((token) => token.id);

    const filter: StringArrayFilterField = {
      key: 'sourceChainTokenId',
      type: 'stringArray',
      operator: field.operator === 'equal' ? 'includes' : 'excludes',
      values: ergoSideTokenIds,
    };

    filters.fields.splice(fieldIndex, 1, filter);
  })();

  const statusIndex = filters.fields?.findIndex((field) => field.key === 'status') ?? -1;

  const status = statusIndex > -1 ? filters.fields?.splice(statusIndex, 1)[0] : undefined;

  const { pagination, sorts, where } = filtersToTypeorm(filters, (key) => {
    switch (key) {
      case 'amount':
      case 'bridgeFee':
      case 'networkFee':
        return `"${key}Normalized"`;
      default:
        return `"${key}"`;
    }
  });

  if (status) {
    switch (status.operator) {
      case 'equal':
        where.statuses = ArrayContains([toDatabaseStatus(status.value as EventStatus)]);
        break;
      case 'notEqual':
        where.statuses = Not(ArrayContains([toDatabaseStatus(status.value as EventStatus)]));
        break;
    }
  }

  const subquery = observationRepository
    .createQueryBuilder('oe')
    .leftJoin(BlockEntity, 'be', 'be.hash = oe.block')
    .leftJoin(EventTriggerEntity, 'ete', 'ete.eventId = oe.requestId')
    .leftJoin(TokenEntity, 'te', 'te.id = oe.sourceChainTokenId')
    .leftJoin(
      EventStatusOverrideEntity,
      'esoe',
      'esoe.eventId = oe.requestId AND (esoe.eventTriggerId IS NULL OR esoe.eventTriggerId = ete.id)',
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
      'esoe.status AS "statusOverrideStatus"',
      'esoe.reason AS "statusOverrideReason"',
      'esoe.severity AS "statusOverrideSeverity"',
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

  queryBuilder = queryBuilder.where(where);

  queryBuilder = queryBuilder.distinct(true);

  sorts?.forEach((sort) => queryBuilder.addOrderBy(sort.key, sort.order));

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
  const rawItems = await queryBuilder.getRawMany();

  const items = rawItems.map(({ total, ...item }) => item);

  return {
    items: items.map(
      ({ statusOverrideStatus, statusOverrideReason, statusOverrideSeverity, ...item }) => ({
        ...item,
        status:
          item.flows > 1
            ? 'MULTIPLE_FLOWS'
            : statusOverrideStatus
              ? {
                  status: statusOverrideStatus,
                  reason: statusOverrideReason,
                  severity: statusOverrideSeverity,
                }
              : fromDatabaseStatus(item.status),
      }),
    ),
    total: rawItems[0]?.total ?? 0,
  };
};

export const getEvent = async (id: string): Promise<EventDetailsType[]> => {
  const events = await dataSource
    .getRepository(ObservationEntity)
    .createQueryBuilder('oe')
    .leftJoin(BlockEntity, 'be', 'be.hash = oe.block')
    .leftJoin(EventTriggerEntity, 'ete', 'ete.eventId = oe.requestId')
    .leftJoin(TokenEntity, 'te', 'te.id = oe.sourceChainTokenId')
    .leftJoin(
      EventStatusOverrideEntity,
      'esoe',
      'esoe.eventId = oe.requestId AND (esoe.eventTriggerId IS NULL OR esoe.eventTriggerId = ete.id)',
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
      'ete.txId AS "txId"',
      'to_jsonb(te) AS "lockToken"',
      'esoe.status AS "statusOverrideStatus"',
      'esoe.reason AS "statusOverrideReason"',
      'esoe.severity AS "statusOverrideSeverity"',
    ])
    .where('oe.requestId = :id', { id })
    .getRawMany();

  if (!events.length) throw new Error(`Not found`);

  const ergoSideTokenIds = events.map((event) => event.lockToken?.ergoSideTokenId).filter(Boolean);

  const tokens = await tokenRepository.findBy({
    isResident: true,
    ergoSideTokenId: In(ergoSideTokenIds),
  });

  const tokensByErgoSideTokenId = new Map(tokens.map((token) => [token.ergoSideTokenId, token]));

  const result = events.map(
    async ({ statusOverrideStatus, statusOverrideReason, statusOverrideSeverity, ...event }) => {
      if (!event.lockToken) throw new Error(`Not found`);

      const token = tokensByErgoSideTokenId.get(event.lockToken.ergoSideTokenId);

      if (!token) throw new Error(`Not found`);

      const price = await tokenPriceAction.getLatestTokenPrice(token.id, event.timestamp);

      const status = statusOverrideStatus
        ? {
            status: statusOverrideStatus,
            reason: statusOverrideReason,
            severity: statusOverrideSeverity,
          }
        : (await getEventStatus(id, event.txId)).status;

      const totalFee = (+event.bridgeFee + +event.networkFee).toString();

      return { ...event, price, status, totalFee };
    },
  );

  return await Promise.all(result);
};

export const getEventStatus = async (
  eventId: string,
  triggerTxId?: string,
  guardPublicKey?: string,
): Promise<EventStatusType> => {
  const result: EventStatusType = {
    status: 'CREATED',
    timestamps: {},
  };

  const observations = await observationRepository.findBy({
    requestId: eventId,
  });

  if (!observations.length) {
    throw new Error('Not found');
  }

  if (observations.length > 1) {
    throw new Error(`ImpossibleBehavior: found more than 1 observation records`, {
      cause: {
        eventId,
        triggerTxId,
        guardPublicKey,
        observationCount: observations.length,
      },
    });
  }

  const observation = observations[0];

  const blocks = await blockRepository.findBy({
    hash: observation.sourceBlockId,
  });

  if (blocks.length !== 1) {
    throw new Error(`ImpossibleBehavior: found more than 1 block records`, {
      cause: {
        eventId,
        triggerTxId,
        guardPublicKey,
        hash: observation.sourceBlockId,
        blockCount: blocks.length,
      },
    });
  }

  const block = blocks[0];

  result.status = 'CREATED';
  result.timestamps.CREATED = block.timestamp;

  if (!triggerTxId) return result;

  const eventTrigger = await eventTriggerRepository.findOneBy({
    txId: triggerTxId,
  });

  if (!eventTrigger) return result;

  if (eventId !== eventTrigger.eventId) {
    throw new Error(`ImpossibleBehavior`, {
      cause: {
        eventId,
        triggerTxId,
        guardPublicKey,
        eventTrigger,
      },
    });
  }

  if (eventTrigger.result === 'fraud') {
    result.status = 'FRAUD';
    if (eventTrigger.spendBlock) {
      result.timestamps.FRAUD = (
        await blockRepository.findOneBy({ hash: eventTrigger.spendBlock })
      )?.timestamp;
    }
  }

  if (eventTrigger.result === 'successful') {
    result.status = 'COMPLETED';
    if (eventTrigger.spendBlock) {
      result.timestamps.COMPLETED = (
        await blockRepository.findOneBy({ hash: eventTrigger.spendBlock })
      )?.timestamp;
    }
  }

  result.timestamps.TRIGGERED = (
    await blockRepository.findOneBy({ hash: eventTrigger.block })
  )?.timestamp;

  let aggregatedStatusChangedItems: AggregatedStatusChangedEntity[] | GuardStatusChangedEntity[];

  if (guardPublicKey) {
    aggregatedStatusChangedItems = await guardStatusChangedRepository.find({
      where: { triggerTxId: triggerTxId, guardPk: guardPublicKey },
      order: { insertedAt: 'DESC' },
    });
  } else {
    aggregatedStatusChangedItems = await aggregatedStatusChangedRepository.find({
      where: { triggerTxId: triggerTxId },
      order: { insertedAt: 'DESC' },
    });
  }

  if (eventTrigger.result === null) {
    let aggregatedStatus: AggregatedStatusEntity | GuardStatusEntity | null;

    if (guardPublicKey) {
      aggregatedStatus = await guardStatusRepository.findOneBy({
        triggerTxId: triggerTxId,
        guardPk: guardPublicKey,
      });
    } else {
      aggregatedStatus = await aggregatedStatusRepository.findOneBy({
        triggerTxId: triggerTxId,
      });
    }

    switch (aggregatedStatus?.status) {
      case null:
      case undefined:
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

  const TIMESTAMP_EXTRACTION_MAP: {
    [key in EventStatus]?: [AggregateEventStatus, AggregateTxStatus | undefined];
  } = {
    PAYMENT_APPROVED: [AggregateEventStatus.inPayment, AggregateTxStatus.inSign],
    PAYMENT_SIGNED: [AggregateEventStatus.inPayment, AggregateTxStatus.signed],
    PAYMENT_SENT: [AggregateEventStatus.inPayment, AggregateTxStatus.sent],
    PAID: [AggregateEventStatus.inPayment, AggregateTxStatus.sent],
    REWARD_APPROVED: [AggregateEventStatus.inReward, AggregateTxStatus.inSign],
    REWARD_SIGNED: [AggregateEventStatus.inReward, AggregateTxStatus.signed],
    REWARD_SENT: [AggregateEventStatus.inReward, AggregateTxStatus.sent],
    REJECTED: [AggregateEventStatus.rejected, undefined],
    REACHED_LIMIT: [AggregateEventStatus.reachedLimit, undefined],
    TIMEOUT: [AggregateEventStatus.timeout, undefined],
  };

  Object.keys(TIMESTAMP_EXTRACTION_MAP).forEach((keyRaw) => {
    const key = keyRaw as EventStatus;

    const [status, txStatus] = TIMESTAMP_EXTRACTION_MAP[key] || [];

    result.timestamps[key] = aggregatedStatusChangedItems.find(
      (item) => item.status === status && (txStatus ? item.txStatus === txStatus : true),
    )?.insertedAt;
  });

  if (eventTrigger.result === 'successful' && eventTrigger.spendBlock) {
    const blocks = await blockRepository.findBy({
      hash: eventTrigger.spendBlock,
    });

    if (blocks.length !== 1) {
      throw new Error(`ImpossibleBehavior: found more than 1 spend block records`, {
        cause: {
          eventId,
          triggerTxId,
          guardPublicKey,
          spendBlock: eventTrigger.spendBlock,
          blockCount: blocks.length,
        },
      });
    }

    const block = blocks[0];

    result.timestamps.REWARDED = block?.timestamp;
  }

  if (observation.toChain === NETWORKS.ergo.key) {
    const items = aggregatedStatusChangedItems.filter(
      (item) => item.status === AggregateEventStatus.finished,
    );

    if (items.length > 1) {
      throw new Error(`ImpossibleBehavior: found more than 1 finished state records`, {
        cause: {
          eventId,
          triggerTxId,
          guardPublicKey,
          observation,
          aggregatedStatusChangedItemsCount: items.length,
        },
      });
    }

    result.timestamps.PAID_CONFIRMED_AT_EXPERIMENTAL = items.at(0)?.insertedAt;
  } else {
    const item = aggregatedStatusChangedItems
      .sort((a, b) => a.insertedAt - b.insertedAt)
      .find((item) => item.status === AggregateEventStatus.pendingReward);

    result.timestamps.PAID_CONFIRMED_AT_EXPERIMENTAL = item?.insertedAt;
  }

  return result;
};
