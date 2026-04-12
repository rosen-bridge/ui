import { BridgeMetricRecord } from '@rosen-ui/rosen-statistics-entity';

/**
 * Aggregated bridge data for a specific chain
 */
export interface AggregatedBridgeData {
  rawUsd: bigint;
  decimals: number;
  maxHeight: number;
  day: number;
  month: number;
  year: number;
  timestamp: number;
}

/**
 * Result of bridge data calculation for a day
 */
export interface BridgeDataCalculationResult {
  bridgeMetricRecords: BridgeMetricRecord[];
  dayTotalRaw: bigint;
  dayMaxDecimals: number;
  totalEventsProcessed: number;
}
