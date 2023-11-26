import { getEvents } from '@/_backend/events/event-repository';

import withValidation from '../withValidation';

import EventsValidations from './validations';

import '../initialize-datasource-if-needed';

export const GET = withValidation(EventsValidations.GET, (value) =>
  getEvents(value.offset, value.limit),
);
