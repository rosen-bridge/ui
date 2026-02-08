import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { MetricAction, METRIC_KEYS } from '@rosen-ui/rosen-statistics-entity';
import { WatcherCountMetricAction } from '@rosen-ui/rosen-statistics-entity';

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

  const watcherAction = new WatcherCountMetricAction(dataSource, logger);
  const metricAction = new MetricAction(dataSource, logger);
  const boxService = new WatcherBoxService(config);
  try {
    const boxes = await boxService.fetchWatcherBoxes();
    logger.debug(`Fetched ${boxes.length} watcher boxes`);

    const networkWatcherCounts: Record<string, number> = {};

    for (const box of boxes) {
      const watcherCount = boxService.extractWatcherCount(box);
      const network = boxService.extractNetwork(box);
      if (!network) continue;
      networkWatcherCounts[network] = watcherCount;
    }

    logger.debug(
      `Found watchers in ${Object.keys(networkWatcherCounts).length} networks`,
    );

    for (const [network, count] of Object.entries(networkWatcherCounts)) {
      const existing = await watcherAction.getWatcherCountByNetwork(network);

      if (existing) {
        logger.debug(
          `Updating watcher count for ${network}: ${existing.count} -> ${count}`,
        );
      } else {
        logger.debug(`Creating watcher count for ${network}: ${count}`);
      }

      await watcherAction.upsertWatcherCount(network, count);
    }

    const totalWatchers = Object.values(networkWatcherCounts).reduce(
      (a: number, b: number) => a + b,
      0,
    );

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
    throw error;
  }
};
