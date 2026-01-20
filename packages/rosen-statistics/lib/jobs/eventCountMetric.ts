import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { EventCountMetricAction } from '@rosen-ui/rosen-statistics-entity';

/**
 * Calculate and persist event count metric.
 *
 * @param dataSource DataSource instance for database operations
 * @param logger     Optional logger instance
 */
export const eventCountMetric = async (
  dataSource: DataSource,
  logger: AbstractLogger = new DummyLogger(),
): Promise<void> => {
  const eventCountMetricAction = new EventCountMetricAction(dataSource, logger);
  logger.debug('Calculating and storing event count metric...');
  await eventCountMetricAction.calculateAndStoreEventCounts();
};
