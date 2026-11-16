import type { DataSource } from '@rosen-bridge/extended-typeorm';

import { EventListViewEntity } from './entities/EventListViewEntity';

/**
 * refresh the event list view without blocking reads
 * @param dataSource
 */
export const refreshEventListView = async (dataSource: DataSource) => {
  // only postgres has a materialized view to refresh
  if (dataSource.options.type !== 'postgres') return;

  const { tableName } = dataSource.getMetadata(EventListViewEntity);

  await dataSource.query(`REFRESH MATERIALIZED VIEW CONCURRENTLY "${tableName}"`);
};
