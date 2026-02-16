import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import {
  MetricAction,
  METRIC_KEYS,
  EventCountMetricAction,
  AggregatedEvents,
} from '@rosen-ui/rosen-statistics-entity';

import { startOfDay } from '../utils';

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

  try {
    const lastHeight = await eventCountAction.getLastProcessedHeight();
    const yesterdayTs = startOfDay(Math.floor(Date.now() / 1000) - 86400);
    console.warn(yesterdayTs);
    const aggregated = await eventCountAction.getAggregatedEvents(
      lastHeight,
      yesterdayTs,
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
    logger.debug(`Event count metric calculation job failed: ${error}`, {
      message: error instanceof Error ? error.message : '',
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
};
