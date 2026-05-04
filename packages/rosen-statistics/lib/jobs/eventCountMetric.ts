import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { BlockDbAction } from '@rosen-bridge/abstract-scanner';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import {
  MetricAction,
  METRIC_KEYS,
  EventCountMetricAction,
  AggregatedEvents,
} from '@rosen-ui/rosen-statistics-entity';

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

  const eventCountAction = new EventCountMetricAction(
    dataSource,
    logger.child('eventCountAction'),
  );
  const metricAction = new MetricAction(
    dataSource,
    logger.child('metricAction'),
  );

  const blockDbAction = new BlockDbAction(
    dataSource,
    'ergo',
    logger.child('blockDbAction'),
  );

  try {
    const lastBlock = await blockDbAction.getLastSavedBlock();
    if (!lastBlock) {
      logger.debug('No block exist.');
      return;
    }
    const lastHeight = await eventCountAction.getLastProcessedHeight();
    const aggregated = await eventCountAction.getAggregatedEvents(
      lastHeight,
      lastBlock.height - 720,
    );
    if (!aggregated.length) {
      logger.debug('No new events to process.');
      return;
    }

    let newTotalCount = 0;
    const aggregatedEvents: AggregatedEvents[] = [];

    for (const row of aggregated) {
      newTotalCount += row.eventCount;

      const existingCount = await eventCountAction.getExistingEventCount(
        row.status,
        row.fromChain,
        row.toChain,
      );

      aggregatedEvents.push({
        status: row.status,
        fromChain: row.fromChain,
        toChain: row.toChain,
        eventCount: existingCount + row.eventCount,
        lastProcessedHeight: row.lastProcessedHeight,
      });
    }

    const totalExistingEvent = await metricAction.getMetricByKey(
      METRIC_KEYS.EVENT_COUNT_TOTAL,
    );
    const existingTotalCount = totalExistingEvent
      ? Number(totalExistingEvent.value)
      : 0;

    await eventCountAction.upsertEventsCount(
      aggregatedEvents,
      newTotalCount + existingTotalCount,
    );

    logger.debug('Event count metric calculation job completed successfully');
  } catch (error) {
    logger.error(`Event count metric calculation job failed: ${error}`, {
      message: error instanceof Error ? error.message : '',
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
};
