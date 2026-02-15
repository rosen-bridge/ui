import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import {
  MetricAction,
  METRIC_KEYS,
  UserEventMetricAction,
  AggregatedUserEvents,
} from '@rosen-ui/rosen-statistics-entity';

import { startOfDay } from '../utils';

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
  const userEventAction = new UserEventMetricAction(
    dataSource,
    logger.child('userEventMetric'),
  );
  const metricAction = new MetricAction(
    dataSource,
    logger.child('metricAction'),
  );

  try {
    const lastHeight = await userEventAction.getLastProcessedHeight();
    const yesterdayTs = startOfDay(Math.floor(Date.now() / 1000) - 86400);
    const aggregated = await userEventAction.getAggregatedEvents(
      lastHeight,
      yesterdayTs,
    );

    if (!aggregated.length) {
      logger.debug('No new events to process.');
      return;
    }

    let newTotalCount = 0;
    const aggregatedUsersEvents: AggregatedUserEvents[] = [];

    for (const row of aggregated) {
      newTotalCount += row.count;

      const existingCount = await userEventAction.getExistingUserEvent(
        row.fromAddress,
        row.toAddress,
      );

      aggregatedUsersEvents.push({
        fromAddress: row.fromAddress,
        toAddress: row.toAddress,
        count: existingCount + row.count,
        lastProcessedHeight: row.lastProcessedHeight,
      });
    }

    const totalExistingEvent = await metricAction.getMetricByKey(
      METRIC_KEYS.USER_EVENT_TOTAL,
    );
    const existingTotalCount = totalExistingEvent
      ? Number(totalExistingEvent.value)
      : 0;

    await userEventAction.upsertEventsCount(
      aggregatedUsersEvents,
      newTotalCount + existingTotalCount,
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
