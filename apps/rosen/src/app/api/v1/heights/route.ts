import { getHeightNetworks } from '@/backend/heightNetworks/services';

import { withValidation } from '../withValidation';
import { validateGet } from './validations';

export const GET = withValidation(validateGet, getHeightNetworks);
