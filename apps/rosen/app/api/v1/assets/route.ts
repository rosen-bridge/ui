import { pick } from 'lodash-es';

import { getAllAssets } from '@/_backend/assets';

import '../initialize-datasource-if-needed';
import withValidation from '../withValidation';

import { validateGet } from './validations';

export const GET = withValidation(validateGet, (value) =>
  getAllAssets(value.offset, value.limit, pick(value, 'chain', 'name', 'id')),
);
