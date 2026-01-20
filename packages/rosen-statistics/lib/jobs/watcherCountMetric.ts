import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import {
  WatcherCountMetricAction,
  WatcherCountConfig,
} from '@rosen-ui/rosen-statistics-entity';

/**
 * Calculate and persist watcher count metric.
 *
 * @param dataSource DataSource instance for database operations
 * @param config     Watcher count metric configuration
 * @param logger     Optional logger instance
 */
export const watcherCountMetric = async (
  dataSource: DataSource,
  config: WatcherCountConfig,
  logger: AbstractLogger = new DummyLogger(),
): Promise<void> => {
  const userEventMetricAction = new WatcherCountMetricAction(
    dataSource,
    config,
    logger,
  );
  logger.debug('Calculating and storing watcher count metric...');
  await userEventMetricAction.calculateAndStoreWatcherCounts();
};
