import type { DataSource } from '@rosen-bridge/extended-typeorm';

import { refreshEventListView } from './refreshEventListView';

/**
 * refresh the event list view now and whenever its source tables change;
 * changes made during a refresh share the next one
 * @param dataSource
 * @param options
 */
export const listenEventListViewRefresh = async (
  dataSource: DataSource,
  { delay = 0, onError }: { delay?: number; onError?: (error: unknown) => void } = {},
) => {
  let scheduled = false;
  let refreshing = false;

  const refresh = async () => {
    scheduled = false;

    if (!dataSource.isInitialized) return;

    refreshing = true;

    try {
      await refreshEventListView(dataSource);
    } catch (error) {
      onError?.(error);
    } finally {
      refreshing = false;
    }

    // refresh again for changes made meanwhile
    if (scheduled) setTimeout(refresh, delay);
  };

  const schedule = () => {
    if (scheduled) return;

    scheduled = true;

    if (!refreshing) setTimeout(refresh, delay);
  };

  const client = await dataSource.createQueryRunner().connect();

  client.on('notification', schedule);
  client.on('error', (error: unknown) => onError?.(error));

  // listen before the initial refresh so no change is missed in between
  await client.query('LISTEN "event_list_view_refresh"');

  refreshing = true;

  try {
    await refreshEventListView(dataSource);
  } finally {
    refreshing = false;
  }

  // refresh again for changes made during the initial refresh
  if (scheduled) setTimeout(refresh, delay);
};
