import crypto from 'node:crypto';

import type { DataSource } from '@rosen-bridge/extended-typeorm';
import {
  AggregatedStatusChangedEntity,
  AggregatedStatusEntity,
  AggregateEventStatus,
  type AggregateTxStatus,
  type EventStatus,
  GuardStatusChangedEntity,
  GuardStatusEntity,
  type Threshold,
  TxEntity,
  type TxStatus,
  type TxType,
  Utils,
} from '@rosen-ui/public-status';

import * as Sentry from '@sentry/nextjs';

import AggregatedStatusAction from './AggregatedStatusAction';
import AggregatedStatusChangedAction from './AggregatedStatusChangedAction';
import GuardStatusAction from './GuardStatusAction';
import GuardStatusChangedAction from './GuardStatusChangedAction';
import TxAction from './TxAction';

/**
 * entry point of data layer (aggregate root)
 * also methods that span multiple entities belong here
 */
export class PublicStatusAction {
  protected readonly dataSource: DataSource;
  private static instance?: PublicStatusAction;

  protected constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  /**
   * initialize PublicStatusAction
   */
  static init = (dataSource: DataSource) => {
    PublicStatusAction.instance = new PublicStatusAction(dataSource);
    AggregatedStatusChangedAction.init();
    AggregatedStatusAction.init();
    GuardStatusChangedAction.init();
    GuardStatusAction.init();
    TxAction.init();
  };

  /**
   * get PublicStatusAction instance or throw
   * @returns PublicStatusAction instance
   */
  static getInstance = () => {
    if (!PublicStatusAction.instance)
      throw Error(
        `PublicStatusAction should have been initialized before getInstance`,
      );
    return PublicStatusAction.instance;
  };

  /**
   * updates guard's status and if the new status changes the aggregated status it also updates aggregated status of the event
   * @param eventId
   * @param triggerTxId
   * @param pk
   * @param timestampSeconds
   * @param status
   * @param tx
   * @returns a promise that resolves to void
   */
  insertStatus = async (
    eventId: string,
    triggerTxId: string,
    pk: string,
    timestampSeconds: number,
    status: EventStatus,
    eventStatusThresholds: Threshold<AggregateEventStatus>[],
    txStatusThresholds: Threshold<AggregateTxStatus>[],
    tx?: {
      txId: string;
      chain: string;
      txType: TxType;
      txStatus: TxStatus;
    },
  ): Promise<void> => {
    // perform operations in a db transaction
    await this.dataSource.manager.transaction(async (entityManager) => {
      // ensure dataSource type is postgres, since sqlite (used in tests)
      // does not support this lock function
      if (this.dataSource.options.type === 'postgres') {
        // acquire a two-key advisory lock (blocks until available)
        // automatically released when the transaction commits or rolls back
        await entityManager.query('SELECT pg_advisory_xact_lock($1, $2)', [
          1, // namespace
          this.intHash(triggerTxId),
        ]);
      }

      // get repositories from transactional entity manager
      const guardStatusRepository =
        entityManager.getRepository(GuardStatusEntity);
      const guardStatusChangedRepository = entityManager.getRepository(
        GuardStatusChangedEntity,
      );
      const aggregatedStatusRepository = entityManager.getRepository(
        AggregatedStatusEntity,
      );
      const aggregatedStatusChangedRepository = entityManager.getRepository(
        AggregatedStatusChangedEntity,
      );
      const txRepository = entityManager.getRepository(TxEntity);

      // if request has tx info specified
      if (tx) {
        // try to insert tx
        try {
          await TxAction.getInstance().insertOne(
            txRepository,
            tx.txId,
            tx.chain,
            eventId,
            timestampSeconds,
            tx.txType,
          );
        } catch (e) {
          if (!(e instanceof Error && e.message === 'tx_exists')) {
            throw e;
          }
        }
      }

      // get array of last status of all guards
      const guardsStatus = await GuardStatusAction.getInstance().getMany(
        guardStatusRepository,
        triggerTxId,
        [],
      );

      const newGuardStatus: GuardStatusEntity = {
        eventId,
        triggerTxId,
        guardPk: pk,
        updatedAt: timestampSeconds,
        status,
        tx: tx
          ? ({
              txId: tx.txId,
              chain: tx.chain,
            } as TxEntity)
          : null,
        txStatus: tx?.txStatus ?? null,
      };

      // inserts or replaces a status with matching pk (if exists) with the new status
      // without mutating the original array
      const newStatuses = Utils.cloneFilterPush(
        guardsStatus.items,
        'guardPk',
        pk,
        newGuardStatus,
      );

      // calculate aggregated status with the new status
      const aggregatedStatusNew = Utils.calcAggregatedStatus(
        newStatuses,
        eventStatusThresholds,
        txStatusThresholds,
      );

      const missingTx =
        !aggregatedStatusNew.tx &&
        [
          AggregateEventStatus.inPayment,
          AggregateEventStatus.inReward,
        ].includes(aggregatedStatusNew.status);

      if (missingTx) {
        Sentry.withScope((scope) => {
          scope.setTag('layer', 'public-event-status');
          Sentry.logger.debug(
            "Aggregated status did not update since the tx is expected based on the event status but it's missing",
            {
              newStatuses,
              eventStatusThresholds,
              txStatusThresholds,
            },
          );
        });
      }

      // get the last aggregated status for comparison with the new aggregated status
      const lastAggregatedStatus =
        await AggregatedStatusAction.getInstance().getOne(
          aggregatedStatusRepository,
          triggerTxId,
        );

      const guardStatusTx = tx
        ? {
            txId: tx.txId,
            chain: tx.chain,
            txStatus: tx.txStatus,
          }
        : undefined;

      const promises = [
        GuardStatusAction.getInstance().upsertOne(
          guardStatusRepository,
          eventId,
          triggerTxId,
          pk,
          timestampSeconds,
          status,
          guardStatusTx,
        ),
        GuardStatusChangedAction.getInstance().insertOne(
          guardStatusChangedRepository,
          eventId,
          triggerTxId,
          pk,
          timestampSeconds,
          status,
          guardStatusTx,
        ),
      ];

      // if no aggregated status exist for this eventId or it has changed, update the aggregated status
      if (
        (!lastAggregatedStatus ||
          Utils.aggregatedStatusesMatch(
            {
              status: lastAggregatedStatus.status,
              txStatus: lastAggregatedStatus.txStatus ?? undefined,
              tx: lastAggregatedStatus.tx ?? undefined,
            },
            aggregatedStatusNew,
          ) === false) &&
        !missingTx
      ) {
        promises.push(
          AggregatedStatusAction.getInstance().upsertOne(
            aggregatedStatusRepository,
            eventId,
            triggerTxId,
            timestampSeconds,
            aggregatedStatusNew.status,
            aggregatedStatusNew.txStatus,
            aggregatedStatusNew.tx,
          ),
          AggregatedStatusChangedAction.getInstance().insertOne(
            aggregatedStatusChangedRepository,
            eventId,
            triggerTxId,
            timestampSeconds,
            aggregatedStatusNew.status,
            aggregatedStatusNew.txStatus,
            aggregatedStatusNew.tx,
          ),
        );
      }

      try {
        await Promise.all(promises);
      } catch (e) {
        if (
          !(
            e instanceof Error &&
            [
              'aggregated_status_not_changed',
              'guard_status_not_changed',
            ].includes(e.message)
          )
        ) {
          throw e;
        }
      }
    });
  };

  /**
   * gets array of AggregatedStatusEntity
   * @param triggerTxIds
   * @returns promise of AggregatedStatusEntity array
   */
  getAggregatedStatuses = (
    triggerTxIds: string[],
  ): Promise<AggregatedStatusEntity[]> => {
    const aggregatedStatusRepository = this.dataSource.getRepository(
      AggregatedStatusEntity,
    );

    return AggregatedStatusAction.getInstance().getMany(
      aggregatedStatusRepository,
      triggerTxIds,
    );
  };

  /**
   * gets array of AggregatedStatusChangedEntity (timeline)
   * @param triggerTxId
   * @param offset
   * @param limit
   * @returns promise of AggregatedStatusChangedEntity array
   */
  getAggregatedStatusTimeline = (
    triggerTxId: string,
    offset?: number,
    limit?: number,
  ) => {
    const aggregatedStatusChangedRepository = this.dataSource.getRepository(
      AggregatedStatusChangedEntity,
    );

    return AggregatedStatusChangedAction.getInstance().getMany(
      aggregatedStatusChangedRepository,
      triggerTxId,
      offset,
      limit,
    );
  };

  /**
   * gets array of GuardStatusChangedEntity (timeline)
   * @param triggerTxId
   * @param guardPks
   * @param offset
   * @param limit
   * @returns promise of GuardStatusChangedEntity array
   */
  getGuardStatusTimeline = (
    triggerTxId: string,
    guardPks: string[],
    offset?: number,
    limit?: number,
  ) => {
    const guardStatusChangedRepository = this.dataSource.getRepository(
      GuardStatusChangedEntity,
    );

    return GuardStatusChangedAction.getInstance().getMany(
      guardStatusChangedRepository,
      triggerTxId,
      guardPks,
      offset,
      limit,
    );
  };

  /**
   * creates a hash from a string value
   * @param value
   * @returns first 4 bytes of the hash as number
   */
  protected intHash = (value: string): number => {
    const hash = crypto.createHash('md5').update(value).digest();
    // read first 4 bytes as a signed 32-bit integer
    return hash.readInt32BE(0);
  };
}
