import {
  AggregateEventStatus,
  AggregateTxStatus,
  EventStatus,
  TxStatus,
  TxType,
} from '../constants';
import { Threshold } from '../types';
import { Utils } from '../utils';
import { DataSourceHandler } from './DataSourceHandler';
import { AggregatedStatusChangedEntity } from './entities/AggregatedStatusChangedEntity';
import { AggregatedStatusEntity } from './entities/AggregatedStatusEntity';
import { GuardStatusChangedEntity } from './entities/GuardStatusChangedEntity';
import { GuardStatusEntity } from './entities/GuardStatusEntity';
import { TxEntity } from './entities/TxEntity';
import AggregatedStatusChangedHandler from './handlers/AggregatedStatusChangedHandler';
import AggregatedStatusHandler from './handlers/AggregatedStatusHandler';
import GuardStatusChangedHandler from './handlers/GuardStatusChangedHandler';
import GuardStatusHandler from './handlers/GuardStatusHandler';
import TxHandler from './handlers/TxHandler';

/**
 * entry point of data layer (aggregate root)
 * also methods that span multiple entities belong here
 */
export class PublicStatusActions {
  /**
   * updates guard's status and if the new status changes the aggregated status it also updates aggregated status of the event
   * @param eventId
   * @param pk
   * @param timestampSeconds
   * @param status
   * @param tx
   * @returns a promise that resolves to void
   */
  static insertStatus = async (
    eventId: string,
    pk: string,
    timestampSeconds: number,
    status: EventStatus,
    eventStatusThresholds: Threshold<AggregateEventStatus>,
    txStatusThresholds: Threshold<AggregateTxStatus>,
    tx?: {
      txId: string;
      chain: string;
      txType: TxType;
      txStatus: TxStatus;
    },
  ): Promise<void> => {
    // perform operations in a db transaction
    await DataSourceHandler.getInstance().dataSource.manager.transaction(
      async (entityManager) => {
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
            await TxHandler.getInstance().insertOne(
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
        const guardsStatus = await GuardStatusHandler.getInstance().getMany(
          guardStatusRepository,
          eventId,
          [],
        );

        const newGuardStatus: GuardStatusEntity = {
          eventId,
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
          guardsStatus,
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

        const guardStatusTx = tx
          ? {
              txId: tx.txId,
              chain: tx.chain,
              txStatus: tx.txStatus,
            }
          : undefined;

        let promises = [
          GuardStatusHandler.getInstance().upsertOne(
            guardStatusRepository,
            eventId,
            pk,
            timestampSeconds,
            status,
            guardStatusTx,
          ),
          GuardStatusChangedHandler.getInstance().insertOne(
            guardStatusChangedRepository,
            eventId,
            pk,
            timestampSeconds,
            status,
            guardStatusTx,
          ),
        ];

        // if eventId is new or aggregated status has changed, update the aggregated status
        if (
          guardsStatus.length === 0 ||
          Utils.aggregatedStatusesMatch(
            Utils.calcAggregatedStatus(
              guardsStatus,
              eventStatusThresholds,
              txStatusThresholds,
            ),
            aggregatedStatusNew,
          ) === false
        ) {
          const aggregatedStatusTx = aggregatedStatusNew.tx
            ? {
                txId: aggregatedStatusNew.tx.txId,
                chain: aggregatedStatusNew.tx.chain,
              }
            : undefined;

          promises.push(
            AggregatedStatusHandler.getInstance().upsertOne(
              aggregatedStatusRepository,
              eventId,
              timestampSeconds,
              aggregatedStatusNew.status,
              aggregatedStatusNew.txStatus,
              aggregatedStatusTx,
            ),
            AggregatedStatusChangedHandler.getInstance().insertOne(
              aggregatedStatusChangedRepository,
              eventId,
              timestampSeconds,
              aggregatedStatusNew.status,
              aggregatedStatusNew.txStatus,
              aggregatedStatusTx,
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
      },
    );
  };

  /**
   * gets array of AggregatedStatusEntity
   * @param eventIds
   * @returns promise of AggregatedStatusEntity array
   */
  static getAggregatedStatuses = (
    eventIds: string[],
  ): Promise<AggregatedStatusEntity[]> => {
    const aggregatedStatusRepository =
      DataSourceHandler.getInstance().dataSource.getRepository(
        AggregatedStatusEntity,
      );

    return AggregatedStatusHandler.getInstance().getMany(
      aggregatedStatusRepository,
      eventIds,
    );
  };

  /**
   * gets array of AggregatedStatusChangedEntity (timeline)
   * @param eventId
   * @returns promise of AggregatedStatusChangedEntity array
   */
  static getAggregatedStatusTimeline = (
    eventId: string,
  ): Promise<AggregatedStatusChangedEntity[]> => {
    const aggregatedStatusChangedRepository =
      DataSourceHandler.getInstance().dataSource.getRepository(
        AggregatedStatusChangedEntity,
      );

    return AggregatedStatusChangedHandler.getInstance().getMany(
      aggregatedStatusChangedRepository,
      eventId,
    );
  };

  /**
   * gets array of GuardStatusChangedEntity (timeline)
   * @param eventId
   * @param guardPks
   * @returns promise of GuardStatusChangedEntity array
   */
  static getGuardStatusTimeline = (
    eventId: string,
    guardPks: string[],
  ): Promise<GuardStatusChangedEntity[]> => {
    const guardStatusChangedRepository =
      DataSourceHandler.getInstance().dataSource.getRepository(
        GuardStatusChangedEntity,
      );

    return GuardStatusChangedHandler.getInstance().getMany(
      guardStatusChangedRepository,
      eventId,
      guardPks,
    );
  };
}
