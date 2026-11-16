import {
  getEvent,
  getEventGuardStatus as getEventGuardStatusBase,
  getEventGuardsStatus as getEventGuardsStatusBase,
  getEvents,
} from './repository';

/**
 * return events with full token data
 * @param filters
 */
export const getEventsWithFullTokenData = getEvents;

export const getEventById = getEvent;

export const getEventGuardsStatus = getEventGuardsStatusBase;

export const getEventGuardStatus = getEventGuardStatusBase;
