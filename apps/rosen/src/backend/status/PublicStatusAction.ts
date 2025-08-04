import { DataSource } from '@rosen-bridge/extended-typeorm';
import {
  AggregateEventStatus,
  AggregateTxStatus,
  EventStatus,
  TxStatus,
  TxType,
  Threshold,
  Utils,
  AggregatedStatusChangedEntity,
  AggregatedStatusEntity,
  GuardStatusChangedEntity,
  GuardStatusEntity,
  TxEntity,
} from '@rosen-ui/public-status';

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
   * @param pk
   * @param timestampSeconds
   * @param status
   * @param tx
   * @returns a promise that resolves to void
   */
  insertStatus = async (
    eventId: string,
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
    await this.dataSource!.manager.transaction(async (entityManager) => {
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
        GuardStatusAction.getInstance().upsertOne(
          guardStatusRepository,
          eventId,
          pk,
          timestampSeconds,
          status,
          guardStatusTx,
        ),
        GuardStatusChangedAction.getInstance().insertOne(
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
          AggregatedStatusAction.getInstance().upsertOne(
            aggregatedStatusRepository,
            eventId,
            timestampSeconds,
            aggregatedStatusNew.status,
            aggregatedStatusNew.txStatus,
            aggregatedStatusTx,
          ),
          AggregatedStatusChangedAction.getInstance().insertOne(
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
    });
  };

  /**
   * gets array of AggregatedStatusEntity
   * @param eventIds
   * @returns promise of AggregatedStatusEntity array
   */
  getAggregatedStatuses = (
    eventIds: string[],
  ): Promise<AggregatedStatusEntity[]> => {
    const aggregatedStatusRepository = this.dataSource!.getRepository(
      AggregatedStatusEntity,
    );

    return AggregatedStatusAction.getInstance().getMany(
      aggregatedStatusRepository,
      eventIds,
    );
  };

  /**
   * gets array of AggregatedStatusChangedEntity (timeline)
   * @param eventId
   * @returns promise of AggregatedStatusChangedEntity array
   */
  getAggregatedStatusTimeline = (
    eventId: string,
  ): Promise<AggregatedStatusChangedEntity[]> => {
    const aggregatedStatusChangedRepository = this.dataSource!.getRepository(
      AggregatedStatusChangedEntity,
    );

    return AggregatedStatusChangedAction.getInstance().getMany(
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
  getGuardStatusTimeline = (
    eventId: string,
    guardPks: string[],
  ): Promise<GuardStatusChangedEntity[]> => {
    const guardStatusChangedRepository = this.dataSource!.getRepository(
      GuardStatusChangedEntity,
    );

    return GuardStatusChangedAction.getInstance().getMany(
      guardStatusChangedRepository,
      eventId,
      guardPks,
    );
  };
}
