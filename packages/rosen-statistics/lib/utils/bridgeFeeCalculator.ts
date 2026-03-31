import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { TokenPriceAction } from '@rosen-bridge/token-price-entity';
import {
  BridgeFeeAggregatedData,
  BridgeFeeType,
} from '@rosen-ui/rosen-statistics-entity';

import { BridgeFeeCalculationResult, AggregatedBridgeFeeData } from '../types';
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
  events: BridgeFeeAggregatedData[],
  tokenPriceAction: TokenPriceAction,
  logger: AbstractLogger,
): Promise<BridgeFeeCalculationResult> => {
  logger.debug(`Processing ${events.length} events for day`);

  const aggregated = new Map<string, AggregatedBridgeFeeData>();
  let dayMaxDecimals = 0;

  for (const e of events) {
    const tokenUsdPrice = await tokenPriceAction.getLatestTokenPrice(
      e.tokenId,
      e.timestamp, // ignoring exact price timestamp for simplicity
    );
    if (tokenUsdPrice === undefined) {
      logger.debug(`Skipping event: missing price for token ${e.tokenId}`);
      continue;
    }

    const tokenUsdPriceString = scientificToString(tokenUsdPrice);
    const tokenUsdPriceDecimals = getNumberOfDecimals(tokenUsdPriceString);
    const tokenUsdPriceRaw = getNonDecimalString(
      tokenUsdPriceString,
      tokenUsdPriceDecimals,
    );

    const rawUsdValue = BigInt(e.bridgeFee) * BigInt(tokenUsdPriceRaw);
    const usdValueDecimals = e.decimal + tokenUsdPriceDecimals;

    const current = aggregated.get(e.fromChain);

    if (current) {
      if (usdValueDecimals > current.decimals) {
        const normalizedCurrent = BigInt(
          multiplyByPowerOfTen(
            current.rawUsd,
            usdValueDecimals - current.decimals,
          ),
        );
        current.rawUsd = normalizedCurrent + rawUsdValue;
        current.decimals = usdValueDecimals;
      } else if (usdValueDecimals < current.decimals) {
        const normalizedNew = BigInt(
          multiplyByPowerOfTen(
            rawUsdValue,
            current.decimals - usdValueDecimals,
          ),
        );
        current.rawUsd += normalizedNew;
      } else {
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

    dayMaxDecimals = Math.max(dayMaxDecimals, usdValueDecimals);
  }

  const bridgeFeeRecords: BridgeFeeType[] = [];
  let dayTotalRaw = 0n;

  for (const [fromChain, data] of aggregated.entries()) {
    let normalizedRawUsd = data.rawUsd;
    if (data.decimals < dayMaxDecimals) {
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
      week: Math.floor(data.timestamp / 604800),
      amount: parseFloat(usdAmountString),
      lastProcessedHeight: data.maxHeight,
    });

    logger.debug(
      `Processed bridge fee for chain ${fromChain}: ${usdAmountString} USD`,
    );
  }

  return {
    bridgeFeeRecords,
    dayTotalRaw,
    dayMaxDecimals,
    totalEventsProcessed: events.length,
  };
};
