import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { UserEventMetricAction } from '@rosen-ui/rosen-statistics-entity';

/**
 * Calculate and persist user event metric.
 *
 * @param dataSource DataSource instance for database operations
 * @param logger     Optional logger instance
 */
export const userEventMetric = async (
  dataSource: DataSource,
  logger: AbstractLogger = new DummyLogger(),
): Promise<void> => {
  const userEventMetricAction = new UserEventMetricAction(dataSource, logger);
  logger.debug('Calculating and storing user event metric...');
  await userEventMetricAction.calculateAndStoreUserCounts();
};
