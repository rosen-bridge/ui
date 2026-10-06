import { getDataSource } from '@rosen-ui/data-source';

import { configs } from './configs';

export default getDataSource(
  configs.db.url,
  configs.db.useSSL ?? false,
  configs.db.logging ?? false,
);
