import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { TokenPriceAction } from '@rosen-bridge/token-price-entity';
import {
  BridgeEventData,
  BridgeMetricRecord,
} from '@rosen-ui/rosen-statistics-entity';

import { WEEK_IN_SECONDS } from '../constants';
import { BridgeDataCalculationResult, AggregatedBridgeData } from '../types';
import {
  getDecimalString,
  getNonDecimalString,
  getNumberOfDecimals,
  multiplyByPowerOfTen,
  scientificToString,
} from './index';

/**
 * Calculate bridge fee USD values from events
 *
 * @param events - Array of bridge fee events
 * @param tokenPriceAction - Token price action instance for fetching prices
 * @param logger - Logger instance
 *
 * @returns Object containing bridge fee records, day total raw value, and max decimals
 */
export const calculateBridgeFees = async (
  events: BridgeEventData[],
  tokenPriceAction: TokenPriceAction,
  logger: AbstractLogger,
): Promise<BridgeDataCalculationResult> => {
  logger.debug(`Processing ${events.length} events for day`);

  const aggregated = new Map<string, AggregatedBridgeData>();
  let dayMaxDecimals = 0;

  for (const e of events) {
    const tokenUsdPrice = await tokenPriceAction.getLatestTokenPrice(
      e.tokenId,
      e.timestamp, // ignoring exact price timestamp for simplicity
    );
    if (tokenUsdPrice === undefined) {
      logger.warn(
        `Cannot calculate bridge fee: missing price for token ${e.tokenId} at timestamp ${e.timestamp}`,
      );
      throw new Error(`Missing token price for token ${e.tokenId}`);
    }

    const tokenUsdPriceString = scientificToString(tokenUsdPrice);
    const tokenUsdPriceDecimals = getNumberOfDecimals(tokenUsdPriceString);
    const tokenUsdPriceRaw = getNonDecimalString(
      tokenUsdPriceString,
      tokenUsdPriceDecimals,
    );

    // Calculate USD value: bridgeFee (token decimals) * tokenPrice (price decimals)
    // Result decimals = token decimals + price decimals
    const rawUsdValue = BigInt(e.bridgeFee) * BigInt(tokenUsdPriceRaw);
    const usdValueDecimals = e.decimal + tokenUsdPriceDecimals;

    const current = aggregated.get(e.fromChain);

    if (current) {
      // Normalize decimals before adding to match current precision
      if (usdValueDecimals > current.decimals) {
        // Scale up current value to new higher precision
        const normalizedCurrent = BigInt(
          multiplyByPowerOfTen(
            current.rawUsd,
            usdValueDecimals - current.decimals,
          ),
        );
        current.rawUsd = normalizedCurrent + rawUsdValue;
        current.decimals = usdValueDecimals;
      } else if (usdValueDecimals < current.decimals) {
        // Scale down new value to match current precision
        const normalizedNew = BigInt(
          multiplyByPowerOfTen(
            rawUsdValue,
            current.decimals - usdValueDecimals,
          ),
        );
        current.rawUsd += normalizedNew;
      } else {
        // Same precision, direct addition
        current.rawUsd += rawUsdValue;
      }
      current.maxHeight = Math.max(current.maxHeight, e.height);
    } else {
      aggregated.set(e.fromChain, {
        rawUsd: rawUsdValue,
        decimals: usdValueDecimals,
        maxHeight: e.height,
        day: e.day,
        month: e.month,
        year: e.year,
        timestamp: e.timestamp,
      });
    }
    // Track highest precision across all chains for final normalization
    dayMaxDecimals = Math.max(dayMaxDecimals, usdValueDecimals);
  }

  const bridgeFeeRecords: BridgeMetricRecord[] = [];
  let dayTotalRaw = 0n;

  // Normalize all chain values to same precision before summing
  for (const [fromChain, data] of aggregated.entries()) {
    let normalizedRawUsd = data.rawUsd;
    if (data.decimals < dayMaxDecimals) {
      // Scale up to highest precision
      normalizedRawUsd = BigInt(
        multiplyByPowerOfTen(data.rawUsd, dayMaxDecimals - data.decimals),
      );
    }
    dayTotalRaw += normalizedRawUsd;

    const usdAmountString = getDecimalString(data.rawUsd, data.decimals);

    bridgeFeeRecords.push({
      fromChain,
      day: data.day,
      month: data.month,
      year: data.year,
      week: Math.floor(data.timestamp / WEEK_IN_SECONDS),
      amount: parseFloat(usdAmountString),
      lastProcessedHeight: data.maxHeight,
    });

    logger.debug(
      `Processed bridge fee for chain ${fromChain}: ${usdAmountString} USD`,
    );
  }

  return {
    bridgeMetricRecords: bridgeFeeRecords,
    dayTotalRaw,
    dayMaxDecimals,
    totalEventsProcessed: events.length,
  };
};
