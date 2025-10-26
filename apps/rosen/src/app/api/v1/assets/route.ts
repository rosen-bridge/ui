import { getAllAssets } from '@/backend/assets';

import { withValidation } from '../withValidation';
import { validateGet } from './validations';

export const GET = withValidation(validateGet, getAllAssets);
