import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { TokenPriceAction } from '@rosen-bridge/token-price-entity';
import {
  LockedAssetsMetricAction,
  METRIC_KEYS,
  MetricAction,
} from '@rosen-ui/rosen-statistics-entity';

import {
  getDecimalString,
  getNonDecimalString,
  getNumberOfDecimals,
  scientificToString,
} from '../utils';

/**
 * Calculate and persist locked assets USD metric.
 *
 * @param dataSource DataSource instance for database operations
 * @param logger     Optional logger instance
 */
export const lockedAssetsMetric = async (
  dataSource: DataSource,
  logger: AbstractLogger = new DummyLogger(),
): Promise<void> => {
  logger.debug('Starting locked assets USD metric calculation job');

  const lockedAssetsMetricAction = new LockedAssetsMetricAction(
    dataSource,
    logger.child('lockedAssetsMetricAction'),
  );
  const metricAction = new MetricAction(
    dataSource,
    logger.child('metricAction'),
  );
  const tokenPriceAction = new TokenPriceAction(
    dataSource,
    logger.child('tokenPriceAction'),
  );

  const timestamp = Math.floor(Date.now() / 1000);

  try {
    const lockedAssets = await lockedAssetsMetricAction.getLockedAssets();
    if (!lockedAssets.length) {
      logger.debug('No locked assets found');
      return;
    }

    let maxDecimals = 0;
    let totalRawNormalized = 0n;
    const processedAssets: {
      raw: bigint;
      decimals: number;
    }[] = [];

    for (const asset of lockedAssets) {
      const tokenUsdPrice = await tokenPriceAction.getLatestTokenPrice(
        asset.tokenId,
        timestamp,
      );
      if (tokenUsdPrice === undefined) continue;

      const tokenUsdPriceString = scientificToString(tokenUsdPrice);
      const tokenUsdPriceDecimals = getNumberOfDecimals(tokenUsdPriceString);
      const tokenUsdPriceInteger = getNonDecimalString(
        tokenUsdPriceString,
        tokenUsdPriceDecimals,
      );

      const rawUsdValue = asset.amount * BigInt(tokenUsdPriceInteger);

      const tokenDecimals =
        (await lockedAssetsMetricAction.getSignificantDecimals(
          asset.tokenId,
        )) ?? 0;

      const usdValueDecimals = tokenDecimals + tokenUsdPriceDecimals;

      maxDecimals = Math.max(maxDecimals, usdValueDecimals);

      processedAssets.push({
        raw: rawUsdValue,
        decimals: usdValueDecimals,
      });

      const usdValueString = getDecimalString(rawUsdValue, usdValueDecimals);
      console.warn(`Asset [${asset.tokenId}]: $${usdValueString}`);
    }

    if (!processedAssets.length) {
      logger.debug('No assets with valid prices');
      return;
    }

    for (const { raw, decimals } of processedAssets) {
      if (decimals < maxDecimals) {
        const multiplier = 10n ** BigInt(maxDecimals - decimals);
        totalRawNormalized += raw * multiplier;
      } else {
        totalRawNormalized += raw;
      }
    }

    const totalUsdValueString = getDecimalString(
      totalRawNormalized,
      maxDecimals,
    );

    logger.debug(`Total locked assets USD value: [${totalUsdValueString}]`);

    await metricAction.upsertMetric(
      METRIC_KEYS.TOTAL_LOCKED_ASSETS_USD,
      totalUsdValueString,
      timestamp,
    );

    logger.debug(
      'Locked assets USD metric calculation job completed successfully',
    );
  } catch (error) {
    logger.debug('Locked assets USD metric calculation job failed', {
      message: error instanceof Error ? error.message : '',
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
};
