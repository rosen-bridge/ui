import type { DataSource } from '@rosen-bridge/extended-typeorm';

import { refreshEventListView } from './refreshEventListView';

/**
 * refresh the event list view on start and whenever its source tables change;
 * notifications received within `delay` are coalesced into one refresh, and
 * refreshes never overlap
 * @param dataSource
 * @param options
 * @param options.delay milliseconds to wait after a notification before refreshing
 * @param options.onError called when refreshing or listening fails
 */
export const listenEventListViewRefresh = async (
  dataSource: DataSource,
  { delay = 0, onError }: { delay?: number; onError?: (error: unknown) => void } = {},
) => {
  if (dataSource.options.type !== 'postgres') return;

  let isScheduled = false;
  let isRefreshing = false;
  let isStale = false;

  const scheduleRefresh = () => {
    if (isRefreshing) {
      isStale = true;
      return;
    }

    if (isScheduled) return;

    isScheduled = true;

    setTimeout(refresh, delay);
  };

  const refresh = async () => {
    isScheduled = false;
    isRefreshing = true;

    try {
      await refreshEventListView(dataSource);
    } catch (error) {
      onError?.(error);
    }

    isRefreshing = false;

    if (isStale) {
      isStale = false;
      scheduleRefresh();
    }
  };

  const listen = async () => {
    const queryRunner = dataSource.createQueryRunner();

    try {
      const connection = await queryRunner.connect();

      connection.on('notification', scheduleRefresh);

      await queryRunner.query(`LISTEN "event_list_view_refresh"`);

      connection.once('error', (error: unknown) => {
        onError?.(error);
        relisten();
      });
    } catch (error) {
      await queryRunner.release();
      throw error;
    }

    scheduleRefresh();
  };

  const relisten = () => {
    setTimeout(async () => {
      try {
        await listen();
      } catch (error) {
        onError?.(error);
        relisten();
      }
    }, 5000);
  };

  await listen();
};
