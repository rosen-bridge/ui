import { getAsset } from '@/_backend/assets';

import { withValidation } from '../../../withValidation';
import { validateGet } from './validations';

export const GET = withValidation(validateGet, (value) => getAsset(value.id));
