import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { V1 } from '@rosen-clients/ergo-explorer';
import { IndexedErgoBox } from '@rosen-clients/ergo-node';
import {
  MetricAction,
  METRIC_KEYS,
  WatcherCountMetricAction,
} from '@rosen-ui/rosen-statistics-entity';

import { NodeBoxFetcher, ExplorerBoxFetcher } from '../services';
import { WatcherCountConfig } from '../types';
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
    logger.child('watcherCountMetric'),
  );
  const metricAction = new MetricAction(
    dataSource,
    logger.child('metricAction'),
  );
  try {
    let result;

    if (config.type === 'explorer') {
      const boxService = new ExplorerBoxFetcher(
        config.url,
        logger.child('explorerFetcher'),
      );
      const boxes = await boxService.fetchUnspentBoxesByTokenId(
        config.rwtRepoNFT,
      );
      logger.debug(`Fetched ${boxes.length} watcher boxes`);
      result = calculateWatcherCounts(
        boxes,
        (box, key) => boxService.getRegisterValue(box as V1.OutputInfo, key),
        config,
        logger,
      );
    } else {
      const boxService = new NodeBoxFetcher(
        config.url,
        logger.child('nodeFetcher'),
      );
      const boxes = await boxService.fetchUnspentBoxesByTokenId(
        config.rwtRepoNFT,
      );
      logger.debug(`Fetched ${boxes.length} watcher boxes`);
      result = calculateWatcherCounts(
        boxes,
        (box, key) => boxService.getRegisterValue(box as IndexedErgoBox, key),
        config,
        logger,
      );
    }

    const { networkWatcherCounts, totalWatchers } = result;
    logger.debug(`Found watchers in ${networkWatcherCounts.length} networks`);

    await watcherAction.upsertWatcherCount(networkWatcherCounts);

    await metricAction.upsertMetric(
      METRIC_KEYS.WATCHER_COUNT_TOTAL,
      totalWatchers.toString(),
      Math.floor(Date.now() / 1000),
    );
    logger.debug(`WatcherCount updated. Total watchers: ${totalWatchers}`);
  } catch (error) {
    logger.error(`Watcher count metric calculation job failed: ${error}`, {
      message: error instanceof Error ? error.message : '',
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
};
