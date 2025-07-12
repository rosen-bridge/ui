import { getEventsWithFullTokenData } from '@/_backend/events';

import { withValidation } from '../withValidation';
import { validateGet } from './validations';

export const GET = withValidation(validateGet, getEventsWithFullTokenData);
