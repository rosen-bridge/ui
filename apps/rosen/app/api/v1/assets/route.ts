import { pick } from 'lodash-es';

import { getAssets } from '@/_backend/assets';

import '../initialize-datasource-if-needed';
import withValidation from '../withValidation';

import { validateGet } from './validations';

export const GET = withValidation(validateGet, (value) =>
  getAssets(value.offset, value.limit, pick(value, 'chain', 'name', 'id')),
);
