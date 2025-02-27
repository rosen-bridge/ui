import { EventStatus, TxType, TxStatus } from '../constants';
import { StatusForAggregate, Utils } from '../utils';
import { GuardStatusChangedEntity } from './entities/GuardStatusChangedEntity';
import { OverallStatusChangedEntity } from './entities/OverallStatusChangedEntity';
import { EventStatusActor } from './EventStatusActor';

/**
 * entry point of data layer (aggregate root)
 * also methods that span multiple entities belong here
 */
export class EventStatusActions {
  /**
   * inserts a guard status and an overall status changed if it change the aggregated status
   * @param insertedAt
   * @param pk
   * @param eventId
   * @param status
   * @param txId
   * @param txType
   * @param txStatus
   * @returns promise of void
   */
  static insertStatus = async (
    insertedAt: number,
    pk: string,
    eventId: string,
    status: EventStatus,
    txId?: string,
    txType?: TxType,
    txStatus?: TxStatus,
  ): Promise<void> => {
    const eventStatusActor = EventStatusActor.getInstance();

    if (txId && txType) {
      await eventStatusActor.insertTx(txId, eventId, insertedAt, txType);
    }

    const guardsLastStatus =
      await eventStatusActor.getGuardsLastStatus(eventId);

    const statuses: StatusForAggregate[] = guardsLastStatus.map((record) => ({
      guardPk: record.guardPk,
      status: record.status,
      txId: record.tx?.txId,
      txStatus: record.txStatus ?? undefined,
    }));

    let aggregatedStatus;
    if (statuses.length > 0) {
      // calc previous aggregated status
      aggregatedStatus = Utils.calcAggregatedStatus(statuses);
    }

    // taking into account the new status
    const newStatuses = statuses.filter((status) => status.guardPk !== pk);
    newStatuses.push({
      guardPk: pk,
      status,
      txId,
      txStatus,
    });

    const aggregatedStatusNew = Utils.calcAggregatedStatus(newStatuses);

    if (
      statuses.length > 0 &&
      Utils.aggregatedStatusesMatch(aggregatedStatus!, aggregatedStatusNew)
    ) {
      await eventStatusActor.insertGuardStatus(
        insertedAt,
        pk,
        eventId,
        status,
        txId,
        txStatus,
      );
      return;
    }

    await Promise.all([
      eventStatusActor.insertOverallStatus(
        insertedAt,
        eventId,
        aggregatedStatusNew.status,
        aggregatedStatusNew.txId,
        aggregatedStatusNew.txStatus,
      ),
      eventStatusActor.insertGuardStatus(
        insertedAt,
        pk,
        eventId,
        status,
        txId,
        txStatus,
      ),
    ]);
  };

  /**
   * gets all OverallStatusChangedEntity records (timeline) by eventId
   * @param eventId
   * @returns promise of OverallStatusChangedEntity array
   */
  static getStatusTimeline = (
    eventId: string,
  ): Promise<OverallStatusChangedEntity[]> => {
    return EventStatusActor.getInstance().getOverallStatusTimeline(eventId);
  };

  /**
   * gets array of last OverallStatusChangedEntity by eventIds
   * @param eventIds
   * @returns promise of OverallStatusChangedEntity array
   */
  static getStatusesById = (
    eventIds: string[],
  ): Promise<OverallStatusChangedEntity[]> => {
    return EventStatusActor.getInstance().getLastOverallStatusesByEventIds(
      eventIds,
    );
  };

  /**
   * gets all GuardStatusChangedEntity records (timeline) by eventId and guardPks
   * @param eventId
   * @param guardPks
   * @returns promise of GuardStatusChangedEntity array
   */
  static getGuardStatusTimeline = (
    eventId: string,
    guardPks: string[],
  ): Promise<GuardStatusChangedEntity[]> => {
    return EventStatusActor.getInstance().getGuardStatusTimeline(
      eventId,
      guardPks,
    );
  };
}
