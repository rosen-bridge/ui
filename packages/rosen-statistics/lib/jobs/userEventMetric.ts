import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { MetricAction, METRIC_KEYS } from '@rosen-ui/rosen-statistics-entity';
import { UserEventMetricAction } from '@rosen-ui/rosen-statistics-entity';

/**
 * Calculate and persist user event count metric.
 *
 * @param dataSource DataSource instance for database operations
 * @param logger Optional logger instance
 */
export const userEventMetric = async (
  dataSource: DataSource,
  logger: AbstractLogger = new DummyLogger(),
): Promise<void> => {
  logger.debug('Starting user event count metric calculation job');
  const userEventAction = new UserEventMetricAction(dataSource, logger);
  const metricAction = new MetricAction(dataSource, logger);

  try {
    const lastHeight = await userEventAction.getLastProcessedHeight();

    const aggregated = await userEventAction.getAggregatedEvents(lastHeight);

    if (!aggregated.length) {
      logger.debug('No new events to process.');
      return;
    }

    let totalCount = 0;

    for (const row of aggregated) {
      const count = row.userCount;
      totalCount += count;

      const existingCount = await userEventAction.getExistingUserEvent(
        row.fromAddress,
        row.toAddress,
      );

      const newCount = existingCount ? existingCount.count + count : count;

      await userEventAction.upsertUserEventCount(
        row.fromAddress,
        row.toAddress,
        newCount,
        row.maxHeight,
      );
    }

    const totalExistingEvent = await metricAction.getMetricByKey(
      METRIC_KEYS.USER_EVENT_TOTAL,
    );
    const existingValue = totalExistingEvent
      ? Number(totalExistingEvent.value)
      : 0;

    const timestamp = Math.floor(Date.now() / 1000);
    const newTotal = existingValue + totalCount;

    logger.debug(
      `Processed ${aggregated.length} event groups, total events: ${totalCount}, new total: ${newTotal}`,
    );

    await metricAction.upsertMetric(
      METRIC_KEYS.USER_EVENT_TOTAL,
      newTotal.toString(),
      timestamp,
    );

    logger.debug(
      'User event count metric calculation job completed successfully',
    );
  } catch (error) {
    logger.debug(`User event count metric calculation job failed: ${error}`, {
      message: error instanceof Error ? error.message : '',
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
};
