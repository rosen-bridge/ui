import assetDetailsService from './asset-details-service';

import withValidation from '../../../withValidation';

import AssetDetailsValidations from './validations';

import '../../../initialize-datasource-if-needed';

export const GET = withValidation(AssetDetailsValidations.GET, (value) =>
  assetDetailsService.getAssetDetails(value.id),
);
