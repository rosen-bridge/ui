import { EventStatus, TxStatus, TxType } from '../constants';
import { StatusForAggregate } from '../types';
import { Utils } from '../utils';
import { dataSource } from './dataSource';
import { AggregatedStatusChangedEntity } from './entities/AggregatedStatusChangedEntity';
import { AggregatedStatusEntity } from './entities/AggregatedStatusEntity';
import { GuardStatusChangedEntity } from './entities/GuardStatusChangedEntity';
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
        // insert tx if it doesn't exist
        await txRepository.insertOne(
          tx.txId,
          tx.chain,
          eventId,
          timestampSeconds,
          tx.txType,
        );
      }

      // get last statuses of all guards
      const guardsStatus = await guardStatusRepository.getMany(eventId, []);

      // map guards statuses to remove their unused properties
      const statuses: StatusForAggregate[] = guardsStatus.map(
        Utils.mapGuardStatusForAggregate,
      );

      // taking into account the new status
      const newStatuses = statuses.filter((status) => status.guardPk !== pk);
      newStatuses.push({
        guardPk: pk,
        status,
        tx: tx
          ? {
              txId: tx.txId,
              chain: tx.chain,
              txStatus: tx.txStatus,
            }
          : undefined,
      });

      // calc new aggregated status
      const aggregatedStatusNew = Utils.calcAggregatedStatus(newStatuses);

      let promises = [
        guardStatusRepository.upsertOne(
          eventId,
          pk,
          timestampSeconds,
          status,
          tx
            ? { txId: tx.txId, chain: tx.chain, txStatus: tx.txStatus }
            : undefined,
        ),
        guardStatusChangedRepository.insertOne(
          eventId,
          pk,
          timestampSeconds,
          status,
          tx
            ? { txId: tx.txId, chain: tx.chain, txStatus: tx.txStatus }
            : undefined,
        ),
      ];

      // if eventId is new or aggregated status has changed, update the aggregated status
      if (
        statuses.length === 0 ||
        Utils.aggregatedStatusesMatch(
          Utils.calcAggregatedStatus(statuses),
          aggregatedStatusNew,
        ) === false
      ) {
        promises.push(
          aggregatedStatusRepository.upsertOne(
            eventId,
            timestampSeconds,
            aggregatedStatusNew.status,
            aggregatedStatusNew.txStatus,
            aggregatedStatusNew.tx
              ? {
                  txId: aggregatedStatusNew.tx.txId,
                  chain: aggregatedStatusNew.tx.chain,
                }
              : undefined,
          ),
          aggregatedStatusChangedRepository.insertOne(
            eventId,
            timestampSeconds,
            aggregatedStatusNew.status,
            aggregatedStatusNew.txStatus,
            aggregatedStatusNew.tx
              ? {
                  txId: aggregatedStatusNew.tx.txId,
                  chain: aggregatedStatusNew.tx.chain,
                }
              : undefined,
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
