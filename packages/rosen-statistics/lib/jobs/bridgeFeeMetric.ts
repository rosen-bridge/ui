import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { TokenPriceAction } from '@rosen-bridge/token-price-entity';
import {
  BridgeFeeMetricAction,
  MetricAction,
  METRIC_KEYS,
} from '@rosen-ui/rosen-statistics-entity';

import { startOfDay } from '../utils';

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
  logger.debug('Calculating and storing bridge fees USD metric...');
  const bridgeFeeAction = new BridgeFeeMetricAction(dataSource, logger);
  const metricAction = new MetricAction(dataSource, logger);
  const tokenPriceAction = new TokenPriceAction(dataSource, logger);

  const lastProcessedHeight = await bridgeFeeAction.getLastProcessedHeight();
  let startTs: number;
  const lastTotalUsd = await metricAction.getMetricByKey(
    METRIC_KEYS.TOTAL_BRIDGE_FEES_USD,
  );
  let newTotalUsd = lastTotalUsd ? Number(lastTotalUsd.value) : 0;

  if (!lastProcessedHeight) {
    const firstEventTimestamp = await bridgeFeeAction.getFirstEventTimestamp();
    if (!firstEventTimestamp) return;
    startTs = startOfDay(firstEventTimestamp);
  } else {
    const lastBlock =
      await bridgeFeeAction.getBlockByHeight(lastProcessedHeight);
    startTs = lastBlock
      ? startOfDay(lastBlock.timestamp + 86400)
      : Math.floor(Date.now() / 1000);
  }

  const yesterdayTs = startOfDay(Math.floor(Date.now() / 1000)) - 1;

  while (startTs < yesterdayTs) {
    const endTs = startTs + 86400;

    const events = await bridgeFeeAction.getEventsInRange(startTs, endTs);
    if (events.length) {
      const aggregated = new Map<string, { usd: number; maxHeight: number }>();

      for (const e of events) {
        const price = await tokenPriceAction.getLatestTokenPrice(
          e.tokenId,
          e.eventTimestamp,
        );
        if (price === undefined) continue;

        const usd = Number(e.bridgeFee) * price;
        const current = aggregated.get(e.fromChain);

        if (current) {
          current.usd += usd;
          current.maxHeight = Math.max(current.maxHeight, e.height);
        } else {
          aggregated.set(e.fromChain, { usd, maxHeight: e.height });
        }
      }

      for (const [fromChain, data] of aggregated.entries()) {
        const { day, month, year, timestamp } = events[0];
        newTotalUsd += data.usd;
        await bridgeFeeAction.upsertBridgeFee({
          fromChain,
          day,
          month,
          year,
          week: Math.floor(timestamp / 604800),
          amount: data.usd,
          lastProcessedHeight: data.maxHeight,
        });
      }
    }
    await metricAction.upsertMetric(
      METRIC_KEYS.TOTAL_BRIDGE_FEES_USD,
      newTotalUsd.toString(),
      Math.floor(Date.now() / 1000),
    );
    startTs += 86400;
  }
};
