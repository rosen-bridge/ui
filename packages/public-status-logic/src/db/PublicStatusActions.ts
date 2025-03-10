import { EventStatus, TxStatus, TxType } from '../constants';
import { StatusForAggregate, Utils } from '../utils';
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
   * @param txId
   * @param txType
   * @param txStatus
   * @returns promise of void
   */
  static insertStatus = async (
    eventId: string,
    pk: string,
    timestampSeconds: number,
    status: EventStatus,
    txId?: string,
    txType?: TxType,
    txStatus?: TxStatus,
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
      if (txId && txType) {
        // insert tx if it doesn't exist
        await txRepository.insertOne(txId, eventId, timestampSeconds, txType);
      }

      // get last statuses of all guards
      const guardsStatus = await guardStatusRepository.getMany(eventId, []);

      // map guard's statuses
      const statuses: StatusForAggregate[] = guardsStatus.map((record) => ({
        guardPk: record.guardPk,
        status: record.status,
        txId: record.tx?.txId,
        txStatus: record.txStatus ?? undefined,
      }));

      // taking into account the new status
      const newStatuses = statuses.filter((status) => status.guardPk !== pk);
      newStatuses.push({
        guardPk: pk,
        status,
        txId,
        txStatus,
      });

      // calc new aggregated status
      const aggregatedStatusNew = Utils.calcAggregatedStatus(newStatuses);

      let promises = [
        guardStatusRepository.upsertOne(
          eventId,
          pk,
          timestampSeconds,
          status,
          txId,
          txStatus,
        ),
        guardStatusChangedRepository.insertOne(
          eventId,
          pk,
          timestampSeconds,
          status,
          txId,
          txStatus,
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
            aggregatedStatusNew.txId,
            aggregatedStatusNew.txStatus,
          ),
          aggregatedStatusChangedRepository.insertOne(
            eventId,
            timestampSeconds,
            aggregatedStatusNew.status,
            aggregatedStatusNew.txId,
            aggregatedStatusNew.txStatus,
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
