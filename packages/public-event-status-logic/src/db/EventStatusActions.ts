import { EventStatus, TxType, TxStatus } from '../constants';
import { getMajorityFromStatuses, majorityMatch } from '../utils';
import { GuardStatusChangedEntity } from './entities/GuardStatusChangedEntity';
import { StatusChangedEntity } from './entities/StatusChangedEntity';
import { EventStatusActor } from './EventStatusActor';

export async function insertStatus(
  insertedAt: number,
  pk: string,
  eventId: string,
  status: EventStatus,
  txId?: string,
  txType?: TxType,
  txStatus?: TxStatus,
): Promise<void> {
  let guardStatuses =
    await EventStatusActor.getInstance().getGuardsLastStatus(eventId);

  let majority;
  if (guardStatuses.length > 0) {
    // calc previous aggregated status
    majority = getMajorityFromStatuses(guardStatuses);
  }

  // taking into account the new status
  const newStatuses = guardStatuses.filter((status) => status.guardPk !== pk);
  newStatuses.push({
    id: -1,
    eventId,
    guardPk: pk,
    insertedAt,
    status,
    txId,
    txType,
    txStatus,
  });

  const majorityNew = getMajorityFromStatuses(newStatuses);

  if (guardStatuses.length > 0 && majorityMatch(majority!, majorityNew)) {
    await EventStatusActor.getInstance().insertGuardStatus(
      insertedAt,
      pk,
      eventId,
      status,
      txId,
      txType,
      txStatus,
    );
  } else {
    await Promise.all([
      EventStatusActor.getInstance().insertStatus(
        insertedAt,
        eventId,
        majorityNew.status,
        majorityNew.txId,
        majorityNew.txType,
        majorityNew.txStatus,
      ),
      EventStatusActor.getInstance().insertGuardStatus(
        insertedAt,
        pk,
        eventId,
        status,
        txId,
        txType,
        txStatus,
      ),
    ]);
  }
}

export function getStatusTimeline(
  eventId: string,
): Promise<StatusChangedEntity[]> {
  return EventStatusActor.getInstance().getStatusTimeline(eventId);
}

export function getStatusesById(
  eventIds: string[],
): Promise<StatusChangedEntity[]> {
  return EventStatusActor.getInstance().getStatusesById(eventIds);
}

export function getGuardStatusTimeline(
  eventId: string,
  guardPks: string[],
): Promise<GuardStatusChangedEntity[]> {
  return EventStatusActor.getInstance().getGuardStatusTimeline(
    eventId,
    guardPks,
  );
}
