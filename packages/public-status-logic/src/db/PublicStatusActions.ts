import { EventStatus, TxStatus, TxType } from '../constants';
import { Utils } from '../utils';
import { dataSource } from './dataSource';
import { AggregatedStatusChangedEntity } from './entities/AggregatedStatusChangedEntity';
import { AggregatedStatusEntity } from './entities/AggregatedStatusEntity';
import { GuardStatusChangedEntity } from './entities/GuardStatusChangedEntity';
import { GuardStatusEntity } from './entities/GuardStatusEntity';
import { TxEntity } from './entities/TxEntity';
import { AggregatedStatusChangedRepository } from './repositories/AggregatedStatusChangedRepository';
import { AggregatedStatusRepository } from './repositories/AggregatedStatusRepository';
import { GuardStatusChangedRepository } from './repositories/GuardStatusChangedRepository';
import { GuardStatusRepository } from './repositories/GuardStatusRepository';
import { TxRepository } from './repositories/TxRepository';

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
    tx?: {
      txId: string;
      chain: string;
      txType: TxType;
      txStatus: TxStatus;
    },
  ): Promise<void> => {
    // perform operations in a db transaction
    await dataSource.manager.transaction(async (entityManager) => {
      // get repositories from transactional entity manager
      const guardStatusRepository = entityManager.withRepository(
        GuardStatusRepository,
      );
      const guardStatusChangedRepository = entityManager.withRepository(
        GuardStatusChangedRepository,
      );
      const aggregatedStatusRepository = entityManager.withRepository(
        AggregatedStatusRepository,
      );
      const aggregatedStatusChangedRepository = entityManager.withRepository(
        AggregatedStatusChangedRepository,
      );
      const txRepository = entityManager.withRepository(TxRepository);

      // if request has tx info specified
      if (tx) {
        // try to insert tx
        try {
          await txRepository.insertOne(
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
      const guardsStatus = await guardStatusRepository.getMany(eventId, []);

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
      const aggregatedStatusNew = Utils.calcAggregatedStatus(newStatuses);

      const guardStatusTx = tx
        ? {
            txId: tx.txId,
            chain: tx.chain,
            txStatus: tx.txStatus,
          }
        : undefined;

      let promises = [
        guardStatusRepository.upsertOne(
          eventId,
          pk,
          timestampSeconds,
          status,
          guardStatusTx,
        ),
        guardStatusChangedRepository.insertOne(
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
          Utils.calcAggregatedStatus(guardsStatus),
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
          aggregatedStatusRepository.upsertOne(
            eventId,
            timestampSeconds,
            aggregatedStatusNew.status,
            aggregatedStatusNew.txStatus,
            aggregatedStatusTx,
          ),
          aggregatedStatusChangedRepository.insertOne(
            eventId,
            timestampSeconds,
            aggregatedStatusNew.status,
            aggregatedStatusNew.txStatus,
            aggregatedStatusTx,
          ),
        );
      }

      await Promise.all(promises);
    });
  };

  /**
   * gets array of AggregatedStatusEntity
   * @param eventIds
   * @returns promise of AggregatedStatusEntity array
   */
  static getAggregatedStatuses = (
    eventIds: string[],
  ): Promise<AggregatedStatusEntity[]> => {
    return AggregatedStatusRepository.getMany(eventIds);
  };

  /**
   * gets array of AggregatedStatusChangedEntity (timeline)
   * @param eventId
   * @returns promise of AggregatedStatusChangedEntity array
   */
  static getAggregatedStatusTimeline = (
    eventId: string,
  ): Promise<AggregatedStatusChangedEntity[]> => {
    return AggregatedStatusChangedRepository.getMany(eventId);
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
    return GuardStatusChangedRepository.getMany(eventId, guardPks);
  };
}
