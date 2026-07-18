import { getEvent, getEvents, getEventStatus } from './repository';

/**
 * return events with full token data
 * @param filters
 */
export const getEventsWithFullTokenData = getEvents;

export const getEventById = async (id: string) => {
  const item = await getEvent(id);

  if (!item) throw new Error(`Not found`);

  return {
    ...item,
    totalFee: (+item.bridgeFee + +item.networkFee).toString(),
  };
};

export const getEventStatusByTriggerTxId = async (
  eventId: string,
  triggerTxId?: string,
  guardPublicKey?: string,
) => {
  return await getEventStatus(eventId, triggerTxId, guardPublicKey);
};
