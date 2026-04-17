import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { BlockDbAction } from '@rosen-bridge/abstract-scanner';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { TokenPriceAction } from '@rosen-bridge/token-price-entity';
import {
  BridgeMetricsAction,
  MetricAction,
  METRIC_KEYS,
} from '@rosen-ui/rosen-statistics-entity';

import { DAY_IN_SECONDS } from '../constants';
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

  const bridgeFeeAction = new BridgeMetricsAction(
    dataSource,
    logger.child('bridgeMetricsAction'),
  );
  const metricAction = new MetricAction(
    dataSource,
    logger.child('metricAction'),
  );
  const tokenPriceAction = new TokenPriceAction(
    dataSource,
    logger.child('tokenPriceAction'),
  );
  const blockDbAction = new BlockDbAction(
    dataSource,
    'ergo',
    logger.child('blockDbAction'),
  );

  try {
    const lastBlock = await blockDbAction.getLastSavedBlock();
    if (!lastBlock || !lastBlock.year || !lastBlock.month || !lastBlock.day) {
      logger.debug('No valid block found with required date fields.');
      return;
    }
    const lastProcessedRecord = await bridgeFeeAction.getLastProcessedRecord();
    const lastTotalUsd = await metricAction.getMetricByKey(
      METRIC_KEYS.TOTAL_BRIDGE_FEES_USD,
    );

    // Load existing total USD value as raw BigInt with its decimals
    let lastTotalUsdValue = lastTotalUsd ? lastTotalUsd.value : '0';
    let lastTotalUsdDecimals = getNumberOfDecimals(lastTotalUsdValue);
    let lastTotalUsdRaw = BigInt(
      getNonDecimalString(lastTotalUsdValue, lastTotalUsdDecimals),
    );

    let startTs: number;
    if (!lastProcessedRecord) {
      logger.debug(
        'No previous bridge fee records found, starting from first event timestamp',
      );
      const firstEventTs = await bridgeFeeAction.getFirstEventTimestamp();
      if (!firstEventTs) {
        logger.debug(
          'No events found in database, skipping bridge fee metric calculation',
        );
        return;
      }
      const startDate = new Date(firstEventTs * 1000);
      startTs = Math.floor(
        new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate(),
        ).getTime() / 1000,
      );
    } else {
      startTs =
        Math.floor(
          new Date(
            lastProcessedRecord.year,
            lastProcessedRecord.month - 1,
            lastProcessedRecord.day,
          ).getTime() / 1000,
        ) + DAY_IN_SECONDS;
    }

    const yesterdayTs =
      Math.floor(
        new Date(lastBlock.year, lastBlock.month - 1, lastBlock.day).getTime() /
          1000,
      ) - DAY_IN_SECONDS;

    let processedDays = 0;
    let totalEventsProcessed = 0;
    let currentTotalRaw = lastTotalUsdRaw;
    let currentMaxDecimals = lastTotalUsdDecimals;

    while (startTs < yesterdayTs) {
      const endTs = startTs + DAY_IN_SECONDS;

      const events = await bridgeFeeAction.getEventsInRange(startTs, endTs);
      if (events.length == 0) {
        startTs += DAY_IN_SECONDS;
        continue;
      }
      const result = await calculateBridgeFees(
        events,
        tokenPriceAction,
        logger.child('calculateBridgeFees'),
      );

      if (result.dayTotalRaw > 0n) {
        if (result.dayMaxDecimals > currentMaxDecimals) {
          // New value has higher precision: scale up existing total
          currentTotalRaw = BigInt(
            multiplyByPowerOfTen(
              currentTotalRaw,
              result.dayMaxDecimals - currentMaxDecimals,
            ),
          );
          currentMaxDecimals = result.dayMaxDecimals;
          currentTotalRaw += result.dayTotalRaw;
        } else {
          // Existing total has higher or equal precision: scale down new value
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

      await bridgeFeeAction.saveBridgeFees(
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
      startTs += DAY_IN_SECONDS;
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
