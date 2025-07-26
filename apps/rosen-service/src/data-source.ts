import { getDataSource } from '@rosen-ui/data-source';

import config from './configs';
import AppError from './errors/AppError';

const dataSource = (() => {
  try {
    return getDataSource(
      config.postgres.url,
      config.postgres.useSSL,
      config.postgres.logging,
    );
  } catch (error) {
    throw new AppError(
      `cannot create data source due to error: ${error}`,
      false,
      'error',
      error instanceof Error ? error.stack : undefined,
      {
        db: {
          url: config.postgres.url,
          logging: config.postgres.logging,
          ssl: config.postgres.useSSL,
        },
      },
    );
  }
})();

export default dataSource;
