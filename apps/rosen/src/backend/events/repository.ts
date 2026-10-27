import { ObservationEntity } from '@rosen-bridge/abstract-observation-extractor';
import { BlockEntity } from '@rosen-bridge/abstract-scanner';
import { In, type SelectQueryBuilder } from '@rosen-bridge/extended-typeorm';
import type { Filter, StringArrayFilterField } from '@rosen-bridge/query-params';
import { TokenPriceAction } from '@rosen-bridge/token-price-entity';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';
import { TokenEntity } from '@rosen-ui/asset-calculator';
import { NETWORKS } from '@rosen-ui/constants';
import { EventListViewEntity, type EventListViewStatus } from '@rosen-ui/event-list-view';
import {
  AggregatedStatusChangedEntity,
  AggregateEventStatus,
  AggregateTxStatus,
  EventStatusOverrideEntity,
  EventStatus as GuardReportedStatus,
  TxStatus as GuardReportedTxStatus,
  GuardStatusChangedEntity,
  GuardStatusEntity,
} from '@rosen-ui/public-status';
import type { Network } from '@rosen-ui/types';

import { filtersToTypeorm } from '@/backend/filtersToTypeorm';
import { NotFoundError } from '@/errors';

import { dataSource } from '../dataSource';
import '../initialize-datasource-if-needed';

const tokenPriceAction = new TokenPriceAction(dataSource);

const blockRepository = dataSource.getRepository(BlockEntity);
const eventTriggerRepository = dataSource.getRepository(EventTriggerEntity);
const observationRepository = dataSource.getRepository(ObservationEntity);
const tokenRepository = dataSource.getRepository(TokenEntity);
const eventListViewRepository = dataSource.getRepository(EventListViewEntity);
const aggregatedStatusChangedRepository = dataSource.getRepository(AggregatedStatusChangedEntity);
const guardStatusChangedRepository = dataSource.getRepository(GuardStatusChangedEntity);

type EventListRow = EventListViewEntity & {
  lockToken: TokenEntity | null;
  statusOverride: EventStatusOverrideEntity | null;
};

type EventListItem = Omit<
  EventListViewEntity,
  | 'triggerId'
  | 'lockTokenId'
  | 'status'
  | 'fromChain'
  | 'toChain'
  | 'amountWithDecimal'
  | 'networkFeeWithDecimal'
  | 'bridgeFeeWithDecimal'
> & {
  lockToken: TokenEntity | null;
  status: EventStatusValue;
  fromChain: Network;
  toChain: Network;
};

type EventListItemWithTotal = {
  items: EventListItem[];
  total: number;
};

type EventStatus = `${EventListViewStatus}`;

type EventStatusValue = EventStatus | EventStatusOverrideEntity;

type EventDetailsRow = EventListViewEntity &
  Pick<EventListRow, 'lockToken' | 'statusOverride'> & {
    totalFee: string;
  };

export type EventDetailsType = EventListItem & {
  price?: number;
  totalFee: string;
  timestamps: EventTimestamps;
};

export type EventTimestamps = Partial<
  Record<EventStatus | 'PAID_CONFIRMED_AT_EXPERIMENTAL', number>
>;

/**
 * select one status override of the `elve` flow as json, preferring an
 * override of the flow over an override of the whole event, then the latest
 * @param qb
 */
const selectStatusOverride = (qb: SelectQueryBuilder<EventStatusOverrideEntity>) =>
  qb
    .select('to_jsonb(esoe)')
    .from(EventStatusOverrideEntity, 'esoe')
    .where('esoe.eventId = elve.eventId')
    .andWhere('(esoe.triggerTxId IS NULL OR esoe.triggerTxId = elve.triggerTxId)')
    .orderBy('esoe.triggerTxId IS NULL', 'ASC')
    .addOrderBy('esoe.id', 'DESC')
    .limit(1);

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
      key: 'lockTokenId',
      type: 'stringArray',
      operator: field.operator === 'equal' ? 'includes' : 'excludes',
      values: ergoSideTokenIds,
    };

    filters.fields.splice(fieldIndex, 1, filter);
  })();

  const { pagination, sorts, where } = filtersToTypeorm(filters, (key) => {
    switch (key) {
      case 'amount':
      case 'bridgeFee':
      case 'networkFee':
        return `${key}WithDecimal`;
      default:
        return key;
    }
  });

  const queryBuilder = eventListViewRepository
    .createQueryBuilder('elve')
    .leftJoin(TokenEntity, 'te', 'te.id = elve.lockTokenId')
    .select(['elve.*', 'to_jsonb(te) AS "lockToken"'])
    .addSelect(selectStatusOverride, 'statusOverride')
    .where(where)
    .andWhere((qb) => {
      const higherMatch = qb
        .subQuery()
        .select('1')
        .from(EventListViewEntity, 'flow')
        .where(where)
        .andWhere('flow.id = elve.id')
        .andWhere('flow.triggerId < elve.triggerId')
        .getQuery();

      return `NOT EXISTS ${higherMatch}`;
    })
    .offset(pagination?.offset)
    .limit(pagination?.limit);

  sorts?.forEach((sort) => queryBuilder.addOrderBy(`elve.${sort.key}`, sort.order));

  const totalQueryBuilder = eventListViewRepository
    .createQueryBuilder('elve')
    .select('CAST(COUNT(DISTINCT elve.id) AS INTEGER)', 'total')
    .where(where);

  const [rawItems, rawTotal] = await Promise.all([
    queryBuilder.getRawMany<EventListRow>(),
    totalQueryBuilder.getRawOne<{ total: number }>(),
  ]);

  return {
    items: rawItems.map((row): EventListItem => {
      const {
        triggerId,
        lockTokenId,
        statusOverride,
        amountWithDecimal,
        bridgeFeeWithDecimal,
        networkFeeWithDecimal,
        ...item
      } = row;

      return {
        ...item,
        fromChain: item.fromChain as Network,
        toChain: item.toChain as Network,
        status: statusOverride ?? item.status,
      };
    }),
    total: rawTotal?.total ?? 0,
  };
};

export const getEvent = async (id: string): Promise<EventDetailsType[]> => {
  const events = await eventListViewRepository
    .createQueryBuilder('elve')
    .leftJoin(TokenEntity, 'te', 'te.id = elve.lockTokenId')
    .select([
      'elve.*',
      'to_jsonb(te) AS "lockToken"',
      'CAST(elve.bridgeFee AS NUMERIC) + CAST(elve.networkFee AS NUMERIC) AS "totalFee"',
    ])
    .addSelect(selectStatusOverride, 'statusOverride')
    .where('elve.eventId = :id', { id })
    .getRawMany<EventDetailsRow>();

  if (!events.length) throw new NotFoundError(`Event with id [${id}] not found`);

  const ergoSideTokenIds = events.map((event) => event.lockToken?.ergoSideTokenId).filter(Boolean);

  const tokens = await tokenRepository.findBy({
    isResident: true,
    ergoSideTokenId: In(ergoSideTokenIds),
  });

  const tokensByErgoSideTokenId = new Map(tokens.map((token) => [token.ergoSideTokenId, token]));

  const result = events.map(async (row) => {
    const {
      triggerId,
      lockTokenId,
      statusOverride,
      amountWithDecimal,
      bridgeFeeWithDecimal,
      networkFeeWithDecimal,
      ...event
    } = row;

    if (!event.lockToken) throw new Error(`Event [${event.eventId}] has no lock token`);

    const token = tokensByErgoSideTokenId.get(event.lockToken.ergoSideTokenId);

    if (!token) {
      throw new Error(`Lock token for event [${event.eventId}] not found in the token table`);
    }

    const price =
      event.timestamp === null
        ? undefined
        : await tokenPriceAction.getLatestTokenPrice(token.id, event.timestamp);

    const status = statusOverride ?? event.status;

    const timestamps = statusOverride
      ? {}
      : await getEventTimestamps(id, event.triggerTxId ?? undefined);

    return {
      ...event,
      fromChain: event.fromChain as Network,
      toChain: event.toChain as Network,
      price,
      status,
      timestamps,
    };
  });

  return await Promise.all(result);
};

/**
 * get the timestamps of each step of an event flow
 * @param eventId
 * @param triggerTxId
 */
export const getEventTimestamps = async (
  eventId: string,
  triggerTxId?: string,
): Promise<EventTimestamps> => {
  const timestamps: EventTimestamps = {};

  const observations = await observationRepository.findBy({
    requestId: eventId,
  });

  if (!observations.length) {
    throw new NotFoundError(`Event with id [${eventId}] not found`);
  }

  if (observations.length > 1) {
    throw new Error(`ImpossibleBehavior: found more than 1 observation records`, {
      cause: {
        eventId,
        triggerTxId,
        observationCount: observations.length,
      },
    });
  }

  const observation = observations.at(0) as ObservationEntity;

  const blocks = await blockRepository.findBy({
    hash: observation.sourceBlockId,
  });

  if (blocks.length !== 1) {
    throw new Error(`ImpossibleBehavior: found more than 1 block records`, {
      cause: {
        eventId,
        triggerTxId,
        hash: observation.sourceBlockId,
        blockCount: blocks.length,
      },
    });
  }

  timestamps.CREATED = blocks.at(0)?.timestamp;

  if (!triggerTxId) return timestamps;

  const eventTrigger = await eventTriggerRepository.findOneBy({
    txId: triggerTxId,
  });

  if (!eventTrigger) return timestamps;

  if (eventId !== eventTrigger.eventId) {
    throw new Error(`ImpossibleBehavior`, {
      cause: {
        eventId,
        triggerTxId,
        eventTrigger,
      },
    });
  }

  if (eventTrigger.result === 'fraud' && eventTrigger.spendBlock) {
    timestamps.FRAUD = (
      await blockRepository.findOneBy({ hash: eventTrigger.spendBlock })
    )?.timestamp;
  }

  if (eventTrigger.result === 'unknown' && eventTrigger.spendBlock) {
    timestamps.UNKNOWN = (
      await blockRepository.findOneBy({ hash: eventTrigger.spendBlock })
    )?.timestamp;
  }

  timestamps.TRIGGERED = (await blockRepository.findOneBy({ hash: eventTrigger.block }))?.timestamp;

  const aggregatedStatusChangedItems = await aggregatedStatusChangedRepository.find({
    where: { triggerTxId: triggerTxId },
    order: { insertedAt: 'DESC' },
  });

  const TIMESTAMP_EXTRACTION_MAP: {
    [key in EventStatus]?: [AggregateEventStatus, AggregateTxStatus | undefined];
  } = {
    PAYMENT_APPROVED: [AggregateEventStatus.inPayment, undefined],
    PAYMENT_SIGNED: [AggregateEventStatus.inPayment, AggregateTxStatus.signed],
    PAYMENT_SENT: [AggregateEventStatus.inPayment, AggregateTxStatus.sent],
    PAID: [AggregateEventStatus.inPayment, AggregateTxStatus.completed],
    PAYMENT_ABORTED: [AggregateEventStatus.inPayment, AggregateTxStatus.invalid],
    PAYMENT_PENDING: [AggregateEventStatus.pendingPayment, undefined],
    PAYMENT_SIGNING: [AggregateEventStatus.inPayment, AggregateTxStatus.inSign],
    PAYMENT_STALLED: [AggregateEventStatus.paymentWaiting, undefined],
    REWARD_APPROVED: [AggregateEventStatus.inReward, undefined],
    REWARD_SIGNED: [AggregateEventStatus.inReward, AggregateTxStatus.signed],
    REWARD_SENT: [AggregateEventStatus.inReward, AggregateTxStatus.sent],
    REWARDED: [AggregateEventStatus.inReward, AggregateTxStatus.completed],
    REWARD_ABORTED: [AggregateEventStatus.inReward, AggregateTxStatus.invalid],
    REWARD_PENDING: [AggregateEventStatus.pendingReward, undefined],
    REWARD_SIGNING: [AggregateEventStatus.inReward, AggregateTxStatus.inSign],
    REWARD_STALLED: [AggregateEventStatus.rewardWaiting, undefined],
    REJECTED: [AggregateEventStatus.rejected, undefined],
    REACHED_LIMIT: [AggregateEventStatus.reachedLimit, undefined],
    TIMEOUT: [AggregateEventStatus.timeout, undefined],
  };

  Object.keys(TIMESTAMP_EXTRACTION_MAP).forEach((keyRaw) => {
    const key = keyRaw as EventStatus;

    const [status, txStatus] = TIMESTAMP_EXTRACTION_MAP[key] || [];

    timestamps[key] = aggregatedStatusChangedItems.find(
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
          spendBlock: eventTrigger.spendBlock,
          blockCount: blocks.length,
        },
      });
    }

    timestamps.COMPLETED = blocks.at(0)?.timestamp;
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
          observation,
          aggregatedStatusChangedItemsCount: items.length,
        },
      });
    }

    timestamps.PAID_CONFIRMED_AT_EXPERIMENTAL = items.at(0)?.insertedAt;
  } else {
    const item = aggregatedStatusChangedItems
      .sort((a, b) => a.insertedAt - b.insertedAt)
      .find((item) => item.status === AggregateEventStatus.pendingReward);

    timestamps.PAID_CONFIRMED_AT_EXPERIMENTAL = item?.insertedAt;
  }

  return timestamps;
};

export type EventGuardStatusType = {
  guardPublicKey: string;
  status:
    | 'COMPLETED'
    | 'PAID'
    | 'PAYMENT_APPROVED'
    | 'PAYMENT_PENDING'
    | 'PAYMENT_SENT'
    | 'PAYMENT_SIGN_FAILED'
    | 'PAYMENT_SIGNED'
    | 'PAYMENT_SIGNING'
    | 'PAYMENT_STALLED'
    | 'REACHED_LIMIT'
    | 'REJECTED'
    | 'REWARDED'
    | 'REWARD_APPROVED'
    | 'REWARD_PENDING'
    | 'REWARD_SENT'
    | 'REWARD_SIGN_FAILED'
    | 'REWARD_SIGNED'
    | 'REWARD_SIGNING'
    | 'REWARD_STALLED'
    | 'TIMEOUT'
    | 'UNKNOWN'
    | 'SPENT';
};

const guardStatusToEventStatus = (
  status?: GuardReportedStatus,
  txStatus?: GuardReportedTxStatus,
): EventGuardStatusType['status'] => {
  switch (status) {
    case GuardReportedStatus.completed:
      return 'COMPLETED';
    case GuardReportedStatus.inPayment: {
      switch (txStatus) {
        case GuardReportedTxStatus.approved:
          return 'PAYMENT_APPROVED';
        case GuardReportedTxStatus.completed:
          return 'PAID';
        case GuardReportedTxStatus.inSign:
          return 'PAYMENT_SIGNING';
        case GuardReportedTxStatus.invalid:
          return 'PAYMENT_SIGNING';
        case GuardReportedTxStatus.sent:
          return 'PAYMENT_SENT';
        case GuardReportedTxStatus.signFailed:
          return 'PAYMENT_SIGN_FAILED';
        case GuardReportedTxStatus.signed:
          return 'PAYMENT_SIGNED';
        default:
          return 'UNKNOWN';
      }
    }
    case GuardReportedStatus.inReward: {
      switch (txStatus) {
        case GuardReportedTxStatus.approved:
          return 'REWARD_APPROVED';
        case GuardReportedTxStatus.completed:
          return 'REWARDED';
        case GuardReportedTxStatus.inSign:
          return 'REWARD_SIGNING';
        case GuardReportedTxStatus.invalid:
          return 'REWARD_SIGNING';
        case GuardReportedTxStatus.sent:
          return 'REWARD_SENT';
        case GuardReportedTxStatus.signFailed:
          return 'REWARD_SIGNING';
        case GuardReportedTxStatus.signed:
          return 'REWARD_SIGNED';
        default:
          return 'UNKNOWN';
      }
    }
    case GuardReportedStatus.paymentWaiting:
      return 'PAYMENT_STALLED';
    case GuardReportedStatus.pendingPayment:
      return 'PAYMENT_PENDING';
    case GuardReportedStatus.pendingReward:
      return 'REWARD_PENDING';
    case GuardReportedStatus.reachedLimit:
      return 'REACHED_LIMIT';
    case GuardReportedStatus.rejected:
      return 'REJECTED';
    case GuardReportedStatus.rewardWaiting:
      return 'REWARD_STALLED';
    case GuardReportedStatus.spent:
      return 'SPENT';
    case GuardReportedStatus.timeout:
      return 'TIMEOUT';
    default:
      return 'UNKNOWN';
  }
};

export const getEventGuardsStatus = async (
  eventId: string,
  triggerTxId: string,
): Promise<EventGuardStatusType[]> => {
  const rows = await dataSource.getRepository(GuardStatusEntity).findBy({
    eventId,
    triggerTxId,
  });
  return rows.map((row) => ({
    guardPublicKey: row.guardPk,
    status: guardStatusToEventStatus(row.status, row.txStatus || undefined),
  }));
};

export type EventGuardTimestampsType = Partial<Record<EventGuardStatusType['status'], number>>;

export const getEventGuardStatus = async (
  triggerTxId: string,
  guardPublicKey: string,
): Promise<EventGuardTimestampsType> => {
  const timestamps: EventGuardTimestampsType = {};

  const changes = await guardStatusChangedRepository.find({
    where: { triggerTxId, guardPk: guardPublicKey },
    order: { insertedAt: 'ASC' },
  });

  for (const change of changes) {
    const status = guardStatusToEventStatus(change.status, change.txStatus || undefined);

    if (status === 'UNKNOWN') continue;

    timestamps[status] ??= change.insertedAt;
  }

  return timestamps;
};
