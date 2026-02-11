import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { MetricAction, METRIC_KEYS } from '@rosen-ui/rosen-statistics-entity';
import { EventCountMetricAction } from '@rosen-ui/rosen-statistics-entity';

/**
 * Calculate and persist event count metric.
 *
 * @param dataSource DataSource instance for database operations
 * @param logger Optional logger instance
 */
export const eventCountMetric = async (
  dataSource: DataSource,
  logger: AbstractLogger = new DummyLogger(),
): Promise<void> => {
  logger.debug('Starting event count metric calculation job');

  const eventCountAction = new EventCountMetricAction(dataSource, logger);
  const metricAction = new MetricAction(dataSource, logger);

  try {
    const lastHeight = await eventCountAction.getLastProcessedHeight();

    const aggregated = await eventCountAction.getAggregatedEvents(lastHeight);

    if (!aggregated.length) {
      logger.debug('No new events to process.');
      return;
    }

    let totalCount = 0;

    for (const row of aggregated) {
      const count = row.eventCount;
      totalCount += count;

      const existingCount = await eventCountAction.getExistingEventCount(
        row.status,
        row.fromChain,
        row.toChain,
      );

      const newCount = existingCount ? existingCount.eventCount + count : count;

      await eventCountAction.upsertEventCount(
        row.status,
        row.fromChain,
        row.toChain,
        newCount,
        row.maxHeight,
      );
    }

    const totalExistingEvent = await metricAction.getMetricByKey(
      METRIC_KEYS.EVENT_COUNT_TOTAL,
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
      METRIC_KEYS.EVENT_COUNT_TOTAL,
      newTotal.toString(),
      timestamp,
    );

    logger.debug('Event count metric calculation job completed successfully');
  } catch (error) {
    logger.debug(`Event count metric calculation job failed: ${error}`, {
      message: error instanceof Error ? error.message : '',
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
};
