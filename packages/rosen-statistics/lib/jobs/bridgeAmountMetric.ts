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
import { MappedBridgeEventData } from '../types';
import {
  getDecimalString,
  getNonDecimalString,
  getNumberOfDecimals,
  multiplyByPowerOfTen,
  calculateBridgeData,
} from '../utils';

/**
 * Calculate and persist bridge amount USD metric.
 *
 * @param dataSource DataSource instance for database operations
 * @param logger     Optional logger instance
 */
export const bridgeAmountMetric = async (
  dataSource: DataSource,
  logger: AbstractLogger = new DummyLogger(),
): Promise<void> => {
  logger.debug('Starting bridge amount metric calculation job');

  const bridgeAmountAction = new BridgeMetricsAction(
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
    const lastProcessedRecord =
      await bridgeAmountAction.getLastBridgeAmountRecord();
    const lastTotalUsd = await metricAction.getMetricByKey(
      METRIC_KEYS.TOTAL_BRIDGE_AMOUNT_USD,
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
        'No previous bridge amount records found, starting from first event timestamp',
      );
      const firstEventTs = await bridgeAmountAction.getFirstEventTimestamp();
      if (!firstEventTs) {
        logger.debug(
          'No events found in database, skipping bridge amount metric calculation',
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

      const events = await bridgeAmountAction.getEventsInRange(startTs, endTs);
      if (events.length == 0) {
        startTs += DAY_IN_SECONDS;
        continue;
      }

      const mappedEvents: MappedBridgeEventData[] = events.map((event) => ({
        fromChain: event.fromChain,
        amount: event.bridgeAmount, // Use bridgeAmount as amount
        tokenId: event.tokenId,
        timestamp: event.timestamp,
        height: event.height,
        day: event.day,
        month: event.month,
        year: event.year,
        decimal: event.decimal,
      }));

      const result = await calculateBridgeData(
        mappedEvents,
        tokenPriceAction,
        logger.child('calculateBridgeData'),
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

      await bridgeAmountAction.saveBridgeAmount(
        result.bridgeMetricRecords,
        newTotalUsdString,
      );

      logger.debug(`Day processed`, {
        startTs: startTs,
        recordsUpserted: result.bridgeMetricRecords.length,
        dayTotalRaw: result.dayTotalRaw.toString(),
        dayMaxDecimals: result.dayMaxDecimals,
        newTotalUsd: newTotalUsdString,
      });

      totalEventsProcessed += result.totalEventsProcessed;
      processedDays++;
      startTs += DAY_IN_SECONDS;
    }

    logger.debug(
      'Bridge amount metric calculation job completed successfully',
      {
        processedDays,
        totalEventsProcessed,
        finalTotalUsd: getDecimalString(currentTotalRaw, currentMaxDecimals),
      },
    );
  } catch (error) {
    logger.error(`Bridge amount metric calculation job failed: ${error}`, {
      message: error instanceof Error ? error.message : '',
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
};
