import { vi } from 'vitest';

import { DataSourceMock } from './db/mocked/DataSource.mock';

vi.mock('../src/db/dataSource', () => {
  return {
    dataSource: DataSourceMock.testDataSource,
  };
});

// mock database
await DataSourceMock.init();
