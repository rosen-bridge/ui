import { DataSourceHandler } from '../../../src/db/DataSourceHandler';

const getString = (key: string): string => {
  if (!process.env[key]) throw new Error(`env variable ${key} not found`);
  return process.env[key]!;
};

const config = {
  postgresUrl: getString('POSTGRES_URL'),
  postgresUseSSL: getString('POSTGRES_USE_SSL') === 'true',
};

DataSourceHandler.init(config.postgresUrl, config.postgresUseSSL);

export const testDataSource = DataSourceHandler.getInstance().dataSource;
