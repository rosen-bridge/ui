import { getEventsWithFullTokenData } from '@/_backend/events';

import withValidation from '../withValidation';

import EventsValidations from './validations';

export const GET = withValidation(EventsValidations.GET, (value) =>
  getEventsWithFullTokenData(value.offset, value.limit),
);
