import { getAsset } from '@/_backend/assets';

import withValidation from '../../../withValidation';

import { validateGet } from './validations';

import '../../../initialize-datasource-if-needed';

export const GET = withValidation(validateGet, (value) => getAsset(value.id));
