import { BridgeFeeType } from '@rosen-ui/rosen-statistics-entity';

/**
 * Aggregated bridge fee data for a specific chain
 */
export interface AggregatedBridgeFeeData {
  rawUsd: bigint;
  decimals: number;
  maxHeight: number;
  day: number;
  month: number;
  year: number;
  timestamp: number;
}

/**
 * Result of bridge fee calculation for a day
 */
export interface BridgeFeeCalculationResult {
  bridgeFeeRecords: BridgeFeeType[];
  dayTotalRaw: bigint;
  dayMaxDecimals: number;
  totalEventsProcessed: number;
}
