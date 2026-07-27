import { ObservationEntity } from '@rosen-bridge/abstract-observation-extractor';
import { BlockEntity } from '@rosen-bridge/abstract-scanner';
import { In } from '@rosen-bridge/extended-typeorm';
import { TokenPriceAction } from '@rosen-bridge/token-price-entity';
import {
  Filters,
  filtersToTypeorm,
} from '@rosen-bridge/ui-kit/dist/components/legacy/smartSearch/server';
import { EventTriggerEntity } from '@rosen-bridge/watcher-data-extractor';
import { TokenEntity } from '@rosen-ui/asset-calculator';
import { NETWORKS } from '@rosen-ui/constants';
import {
  AggregatedStatusChangedEntity,
  AggregatedStatusEntity,
  AggregateEventStatus,
  AggregateTxStatus,
  GuardStatusChangedEntity,
  GuardStatusEntity,
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
const guardStatusRepository = dataSource.getRepository(GuardStatusEntity);
const guardStatusChangedRepository = dataSource.getRepository(
  GuardStatusChangedEntity,
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

export type EventDetailsType = Omit<EventWithTotal, 'status' | 'total'> & {
  txId: string;
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
    | 'REWARDED'
    | 'REWARD_APPROVED'
    | 'REWARD_SENT'
    | 'REWARD_SIGNED'
    | 'REWARD_SIGNING'
    | 'REWARD_STALLED'
    | 'TIMEOUT'
    | 'TRIGGERED'
    | 'UNKNOWN';
  timestamps: Partial<Record<EventDetailsType['status'], number>>;
  price?: number;
  totalFee: string;
};

export type EventStatusType = {
  status: EventDetailsType['status'];
  timestamps: Partial<
    Record<
      EventDetailsType['status'] | 'PAID_CONFIRMED_AT_EXPERIMENTAL',
      number
    >
  >;
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
  const events = await dataSource
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
    .getRawMany<EventDetailsType>();

  if (!events.length) throw new Error(`Not found`);

  const result = events.map(async (event) => {
    if (!event.lockToken) throw new Error(`Not found`);

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

    const { status, timestamps } = await getEventStatus(id, event.txId);
    event.status = status;
    event.timestamps = timestamps;

    return {
      ...event,
      price,
      totalFee: (+event.bridgeFee + +event.networkFee).toString(),
    };
  });

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
    throw new Error(
      `ImpossibleBehavior: found more than 1 observation records`,
      {
        cause: {
          eventId,
          triggerTxId,
          guardPublicKey,
          observationCount: observations.length,
        },
      },
    );
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
  result.timestamps['CREATED'] = block.timestamp;

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

  result.timestamps['TRIGGERED'] = (
    await blockRepository.findOneBy({ hash: eventTrigger.block })
  )?.timestamp;

  let aggregatedStatusChangedItems:
    | AggregatedStatusChangedEntity[]
    | GuardStatusChangedEntity[];

  if (guardPublicKey) {
    aggregatedStatusChangedItems = await guardStatusChangedRepository.find({
      where: { triggerTxId: triggerTxId, guardPk: guardPublicKey },
      order: { insertedAt: 'DESC' },
    });
  } else {
    aggregatedStatusChangedItems = await aggregatedStatusChangedRepository.find(
      {
        where: { triggerTxId: triggerTxId },
        order: { insertedAt: 'DESC' },
      },
    );
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
    [key in EventDetailsType['status']]?: [
      AggregateEventStatus,
      AggregateTxStatus | undefined,
    ];
  } = {
    PAYMENT_APPROVED: [
      AggregateEventStatus.inPayment,
      AggregateTxStatus.inSign,
    ],
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
    const key = keyRaw as EventDetailsType['status'];

    const [status, txStatus] = TIMESTAMP_EXTRACTION_MAP[key] || [];

    result.timestamps[key] = aggregatedStatusChangedItems.find(
      (item) =>
        item.status === status &&
        (txStatus ? item.txStatus === txStatus : true),
    )?.insertedAt;
  });

  if (eventTrigger.result === 'successful' && eventTrigger.spendBlock) {
    const blocks = await blockRepository.findBy({
      hash: eventTrigger.spendBlock,
    });

    if (blocks.length !== 1) {
      throw new Error(
        `ImpossibleBehavior: found more than 1 spend block records`,
        {
          cause: {
            eventId,
            triggerTxId,
            guardPublicKey,
            spendBlock: eventTrigger.spendBlock,
            blockCount: blocks.length,
          },
        },
      );
    }

    const block = blocks[0];

    result.timestamps['REWARDED'] = block?.timestamp;
  }

  if (observation.toChain === NETWORKS.ergo.key) {
    const items = aggregatedStatusChangedItems.filter(
      (item) => item.status === AggregateEventStatus.finished,
    );

    if (items.length > 1) {
      throw new Error(
        `ImpossibleBehavior: found more than 1 finished state records`,
        {
          cause: {
            eventId,
            triggerTxId,
            guardPublicKey,
            observation,
            aggregatedStatusChangedItemsCount: items.length,
          },
        },
      );
    }

    result.timestamps['PAID_CONFIRMED_AT_EXPERIMENTAL'] =
      items.at(0)?.insertedAt;
  } else {
    const item = aggregatedStatusChangedItems
      .sort((a, b) => a.insertedAt - b.insertedAt)
      .find((item) => item.status === AggregateEventStatus.pendingReward);

    result.timestamps['PAID_CONFIRMED_AT_EXPERIMENTAL'] = item?.insertedAt;
  }

  return result;
};
