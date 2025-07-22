import { pick } from 'lodash-es';

import { getAllAssets } from '@/backend/assets';

import { withValidation } from '../withValidation';
import { validateGet } from './validations';

export const GET = withValidation(validateGet, (value) =>
  getAllAssets(value.offset, value.limit, pick(value, 'chain', 'name', 'id')),
);
