import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import {
  MetricAction,
  METRIC_KEYS,
  WatcherCountType,
  WatcherCountMetricAction,
} from '@rosen-ui/rosen-statistics-entity';

import { WatcherBoxService } from '../services';
import { WatcherCountConfig } from '../types';

/**
 * Calculate and persist watcher count metric.
 *
 * @param dataSource DataSource instance for database operations
 * @param config Configuration for watcher count calculation
 * @param logger Optional logger instance
 */
export const watcherCountMetric = async (
  dataSource: DataSource,
  config: WatcherCountConfig,
  logger: AbstractLogger = new DummyLogger(),
): Promise<void> => {
  logger.debug('Starting watcher count metric calculation job');

  const watcherAction = new WatcherCountMetricAction(
    dataSource,
    logger.child('watcherCountMetric'),
  );
  const metricAction = new MetricAction(
    dataSource,
    logger.child('metricAction'),
  );
  const boxService = new WatcherBoxService(
    config,
    logger.child('watcherBoxService'),
  );
  try {
    const boxes = await boxService.fetchWatcherBoxes();
    logger.debug(`Fetched ${boxes.length} watcher boxes`);

    const networkWatcherCounts: WatcherCountType[] = [];
    let totalWatchers = 0;

    for (const box of boxes) {
      const network = boxService.extractNetwork(box);
      if (!network) continue;
      const count = boxService.extractWatcherCount(box);
      networkWatcherCounts.push({ network, count });
      totalWatchers += count;
    }

    logger.debug(`Found watchers in ${networkWatcherCounts.length} networks`);

    await watcherAction.upsertWatcherCount(networkWatcherCounts);

    await metricAction.upsertMetric(
      METRIC_KEYS.WATCHER_COUNT_TOTAL,
      totalWatchers.toString(),
      Math.floor(Date.now() / 1000),
    );
    logger.debug(`WatcherCount updated. Total watchers: ${totalWatchers}`);
  } catch (error) {
    logger.debug(`Watcher count metric calculation job failed: ${error}`, {
      message: error instanceof Error ? error.message : '',
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
};
