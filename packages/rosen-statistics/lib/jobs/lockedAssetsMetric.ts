import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { LockedAssetsMetricAction } from '@rosen-ui/rosen-statistics-entity';

/**
 * Calculate and persist locked assets usd metric.
 *
 * @param dataSource DataSource instance for database operations
 * @param logger     Optional logger instance
 */
export const lockedAssetsMetric = async (
  dataSource: DataSource,
  logger: AbstractLogger = new DummyLogger(),
): Promise<void> => {
  const lockedAssetsMetricAction = new LockedAssetsMetricAction(
    dataSource,
    logger,
  );
  logger.debug('Calculating and storing locked assets usd metric...');
  await lockedAssetsMetricAction.calculateAndStoreLockedAssetsUsd();
};
