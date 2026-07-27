import { getEvent, getEvents, getEventStatus } from './repository';

/**
 * return events with full token data
 * @param filters
 */
export const getEventsWithFullTokenData = getEvents;

export const getEventById = async (id: string) => {
  return await getEvent(id);
};

export const getEventStatusByTriggerTxId = async (
  eventId: string,
  triggerTxId?: string,
  guardPublicKey?: string,
) => {
  return await getEventStatus(eventId, triggerTxId, guardPublicKey);
};
