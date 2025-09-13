import { ObservationEntity } from '@rosen-bridge/observation-extractor';
import { BlockEntity } from '@rosen-bridge/scanner';
import {
  Filters,
  filtersToTypeorm,
} from '@rosen-bridge/ui-kit/dist/components/common/smartSearch/server';
import {
  CommitmentEntity,
  EventTriggerEntity,
} from '@rosen-bridge/watcher-data-extractor';
import { Network } from '@rosen-ui/types';

import {
  EventDetailsV2,
  RosenChainTokenV2,
  TokenCollectionV2,
  TokenInfoV2,
} from '@/app/events/[details]/type';
import { getTokenMap } from '@/tokenMap/getServerTokenMap';

import { dataSource } from '../dataSource';
import '../initialize-datasource-if-needed';

const blockRepository = dataSource.getRepository(BlockEntity);
const eventTriggerRepository = dataSource.getRepository(EventTriggerEntity);
const observationRepository = dataSource.getRepository(ObservationEntity);
const commitmentRepository = dataSource.getRepository(CommitmentEntity);

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

export const getEventById = async (
  eventId: string,
): Promise<EventDetailsV2 | null> => {
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
      'et.txId AS "triggerTxId"',
    ])
    .addSelect(
      `FIRST_VALUE(et.result) OVER(
        PARTITION BY et.eventId 
        ORDER BY COALESCE(et.result, 'PROCESSING') DESC
      )`,
      'status',
    )
    .where('obs.requestId = :eventId', { eventId });

  const commitmentsByEventId = await getCommitmentsByEventId(eventId);
  const result = await qb.getRawOne<EventDetailsV2>();
  if (!result) return null;

  const tokenMap = await getTokenMap();
  const collections = tokenMap.getConfig();

  const findTokenInfo = (tokenId?: string): TokenInfoV2 | null => {
    if (!tokenId) return null;

    for (const collection of collections as TokenCollectionV2[]) {
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
    height: Number(result.height),
    blockHeight: Number(result.blockHeight),
    WIDsCount: Number(result.WIDsCount),
    commitments: commitmentsByEventId,
    sourceToken: findTokenInfo(result.sourceChainTokenId),
    targetToken: findTokenInfo(result.targetChainTokenId),
  };
};

export const getCommitmentsByEventId = async (eventId: string) => {
  return await commitmentRepository.find({
    where: { eventId },
  });
};

//todo: this func for test
const simulateDelay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
const maybeThrowError = () => {
  if (Math.random() < 0.1) {
    throw new Error('Something went wrong');
  }
};

export const getEventWatchers = async (eventId: string) => {
  await simulateDelay(5000);
  maybeThrowError();

  return {
    eventId,
    triggeredBy: Math.floor(Math.random() * 31),
    commitments: Math.floor(Math.random() * 101),
    rewardedTo: Math.floor(Math.random() * 30),
    watchers: [
      {
        id: 1,
        wid: '3030527c8fc3b9271c27e1e929fdcd39e71e9',
        commitment: 'f366b7a2f50f6854b408d82f1c27e1e929fdcd39851fb',
        rewarded: 'Yes',
      },
      {
        id: 2,
        wid: '3030520527c8fc3b92734b408d82f1c27e1e929fdcd39e71e9',
        commitment: 'f366b7a2f502734b408d82f1c27e1e929fdcd39851fb',
        rewarded: 'Yes',
      },
      {
        id: 3,
        wid: '3030527c408d82f1c27e1e929fdcd39e71e9',
        commitment:
          'f366b7a2f50f685dfbf872903ec3b92734b408d82f1c27e1e929fdcd39851fb',
        rewarded: 'Yes',
      },
      {
        id: 4,
        wid: '3030527c8fc3bfc3b92734b408d82f1c27e1e929fdcd39e71e9',
        commitment: 'f366b7a2f50f692734b408d82f1c27e1e929fdcd39851fb',
        rewarded: 'No',
      },
      {
        id: 5,
        wid: '3030527c8fc3b92734b408d82f1c27e1e929fdcd393030527c8fc3b92734b408d82f1c27e1e929fdcd39e71e9',
        commitment:
          'f366b7a2f50f685dfbf872903e115851fb798253030527c8fc3b92734b408d82f1c27e1e929fdcd39851fb',
        rewarded: 'Yes',
      },
    ],
  };
};

export const getEventProcess = async (eventId: string) => {
  await simulateDelay(5000);
  maybeThrowError();

  return {
    eventId,
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

export const getEventMetadata = async (eventId: string) => {
  await simulateDelay(5000);
  maybeThrowError();

  return {
    eventId,
    metadata: 'testing response metadata🧪',
  };
};
