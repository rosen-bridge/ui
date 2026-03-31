import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { TokenPriceAction } from '@rosen-bridge/token-price-entity';
import {
  BridgeFeeMetricAction,
  MetricAction,
  METRIC_KEYS,
} from '@rosen-ui/rosen-statistics-entity';

import {
  getDecimalString,
  getNonDecimalString,
  getNumberOfDecimals,
  multiplyByPowerOfTen,
  calculateBridgeFees,
} from '../utils';

/**
 * Calculate and persist bridge fee USD metric.
 *
 * @param dataSource DataSource instance for database operations
 * @param logger     Optional logger instance
 */
export const bridgeFeeMetric = async (
  dataSource: DataSource,
  logger: AbstractLogger = new DummyLogger(),
): Promise<void> => {
  logger.debug('Starting bridge fee metric calculation job');

  const bridgeFeeAction = new BridgeFeeMetricAction(
    dataSource,
    logger.child('bridgeFeeMetricAction'),
  );
  const metricAction = new MetricAction(
    dataSource,
    logger.child('metricAction'),
  );
  const tokenPriceAction = new TokenPriceAction(
    dataSource,
    logger.child('tokenPriceAction'),
  );

  try {
    const lastProcessedRecord = await bridgeFeeAction.getLastProcessedRecord();
    const lastTotalUsd = await metricAction.getMetricByKey(
      METRIC_KEYS.TOTAL_BRIDGE_FEES_USD,
    );

    let lastTotalUsdValue = lastTotalUsd ? lastTotalUsd.value : '0';
    let lastTotalUsdDecimals = getNumberOfDecimals(lastTotalUsdValue);
    let lastTotalUsdRaw = BigInt(
      getNonDecimalString(lastTotalUsdValue, lastTotalUsdDecimals),
    );

    let startTs = lastProcessedRecord
      ? Math.floor(
          new Date(
            lastProcessedRecord.year,
            lastProcessedRecord.month - 1,
            lastProcessedRecord.day + 1,
          ).getTime() / 1000,
        )
      : await bridgeFeeAction.getFirstEventTimestamp();

    if (!startTs) {
      logger.debug(
        'No events found in database, skipping bridge fee metric calculation',
      );
      return;
    }

    const now = new Date();
    const yesterdayTs =
      Math.floor(
        new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() /
          1000,
      ) - 86400;

    let processedDays = 0;
    let totalEventsProcessed = 0;
    let currentTotalRaw = lastTotalUsdRaw;
    let currentMaxDecimals = lastTotalUsdDecimals;

    while (startTs < yesterdayTs) {
      const endTs = startTs + 86400;

      const events = await bridgeFeeAction.getEventsInRange(startTs, endTs);
      if (events.length == 0) {
        startTs += 86400;
        continue;
      }
      const result = await calculateBridgeFees(
        events,
        tokenPriceAction,
        logger.child('bridgeFeeCalculator'),
      );

      if (result.dayTotalRaw > 0n) {
        if (result.dayMaxDecimals > currentMaxDecimals) {
          currentTotalRaw = BigInt(
            multiplyByPowerOfTen(
              currentTotalRaw,
              result.dayMaxDecimals - currentMaxDecimals,
            ),
          );
          currentMaxDecimals = result.dayMaxDecimals;
          currentTotalRaw += result.dayTotalRaw;
        } else {
          const normalizedDayTotal = BigInt(
            multiplyByPowerOfTen(
              result.dayTotalRaw,
              currentMaxDecimals - result.dayMaxDecimals,
            ),
          );
          currentTotalRaw += normalizedDayTotal;
        }
      }

      const newTotalUsdString = getDecimalString(
        currentTotalRaw,
        currentMaxDecimals,
      );

      await bridgeFeeAction.upsertBridgeFees(
        result.bridgeFeeRecords,
        newTotalUsdString,
      );

      logger.debug(`Day processed`, {
        startTs: startTs,
        recordsUpserted: result.bridgeFeeRecords.length,
        dayTotalRaw: result.dayTotalRaw.toString(),
        dayMaxDecimals: result.dayMaxDecimals,
        newTotalUsd: newTotalUsdString,
      });

      totalEventsProcessed += result.totalEventsProcessed;
      processedDays++;
      startTs += 86400;
    }

    logger.debug('Bridge fee metric calculation job completed successfully', {
      processedDays,
      totalEventsProcessed,
      finalTotalUsd: getDecimalString(currentTotalRaw, currentMaxDecimals),
    });
  } catch (error) {
    logger.error(`Bridge fee metric calculation job failed: ${error}`, {
      message: error instanceof Error ? error.message : '',
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
};
