import {
  type AbstractLogger,
  DummyLogger,
} from '@rosen-bridge/abstract-logger';
import type { DataSource } from '@rosen-bridge/extended-typeorm';
import {
  METRIC_KEYS,
  MetricAction,
  WatcherCountMetricAction,
} from '@rosen-ui/rosen-statistics-entity';

import { NodeBoxFetcher } from '../fetchers';
import type { WatcherCountConfig } from '../types';
import { calculateWatcherCounts } from '../utils';

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
    logger.child('watcherCountMetricAction'),
  );
  const metricAction = new MetricAction(
    dataSource,
    logger.child('metricAction'),
  );
  try {
    const boxService = new NodeBoxFetcher(
      config.url,
      logger.child('nodeBoxFetcher'),
    );
    const boxes = await boxService.fetchUnspentBoxesByTokenId(
      config.rwtRepoNFT,
    );
    logger.debug(`Fetched ${boxes.length} watcher boxes from Node provider`);
    const result = calculateWatcherCounts(boxes, config, logger);

    logger.debug(
      `Found watchers in ${result.networkWatcherCounts.length} networks`,
    );

    await watcherAction.upsertWatcherCount(result.networkWatcherCounts);

    await metricAction.upsertMetric(
      METRIC_KEYS.WATCHER_COUNT_TOTAL,
      result.totalWatchers.toString(),
      Math.floor(Date.now() / 1000),
    );
    logger.debug(
      `WatcherCount updated. Total watchers: ${result.totalWatchers}`,
    );
  } catch (error) {
    logger.error(`Watcher count metric calculation job failed: ${error}`, {
      message: error instanceof Error ? error.message : '',
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
};
