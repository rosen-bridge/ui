import { getDataSource } from '@rosen-ui/data-source';

export const dataSource = getDataSource(
  process.env.POSTGRES_URL!,
  process.env.POSTGRES_USE_SSL === 'true',
  false,
);
