import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { BlockDbAction } from '@rosen-bridge/abstract-scanner';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import {
  MetricAction,
  METRIC_KEYS,
  UserEventMetricAction,
  AggregatedUserEvents,
} from '@rosen-ui/rosen-statistics-entity';

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
    const lastHeight = await userEventAction.getLastProcessedHeight();
    const aggregated = await userEventAction.getAggregatedEvents(
      lastHeight,
      lastBlock.height - 720,
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
        row.fromChain,
        row.toAddress,
        row.toChain,
      );

      aggregatedUsersEvents.push({
        fromAddress: row.fromAddress,
        toAddress: row.toAddress,
        count: existingCount + row.count,
        lastProcessedHeight: row.lastProcessedHeight,
        fromChain: row.fromChain,
        toChain: row.toChain,
      });
    }

    const totalExistingEvent = await metricAction.getMetricByKey(
      METRIC_KEYS.USER_EVENT_TOTAL,
    );
    const existingTotalCount = totalExistingEvent
      ? Number(totalExistingEvent.value)
      : 0;

    await userEventAction.upsertUserEventsCount(
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
  }
};
