import { pick } from 'lodash-es';

import assetService from './assets-service';

import withValidation from '../withValidation';

import EventsValidations from './validations';

import '../initialize-datasource-if-needed';

export const GET = withValidation(EventsValidations.GET, (value) =>
  assetService.getAssets(
    value.offset,
    value.limit,
    pick(value, 'chain', 'name', 'id'),
  ),
);
