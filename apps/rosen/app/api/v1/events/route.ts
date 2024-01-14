import eventService from '@/_backend/events/event-service';

import withValidation from '../withValidation';

import EventsValidations from './validations';

import '../initialize-datasource-if-needed';

export const GET = withValidation(EventsValidations.GET, (value) =>
  eventService.getEventsWithFullTokenData(value.offset, value.limit),
);
