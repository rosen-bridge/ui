import { type LastSavedBlock, ScannerSyncHealthCheckParam } from '@rosen-bridge/scanner-sync-check';

import type { BitcoinCashServiceConfig } from './config';

/**
 * Creates native BCH scanner health only for an initialized enabled scanner.
 * @param options Validated BCH operator configuration.
 * @param scanner BCH lifecycle identity, absent while disabled or initialization fails.
 * @param getLastSavedBlock Reader of persisted scanner height and second-based timestamp.
 * @returns BCH health parameter, or undefined while disabled.
 * @throws Error When enabled scanning has no matching initialized scanner.
 */
export const createBitcoinCashScannerHealthCheck = (
  options: BitcoinCashServiceConfig,
  scanner: { name: () => string } | undefined,
  getLastSavedBlock: (name: string) => Promise<LastSavedBlock>,
): ScannerSyncHealthCheckParam | undefined => {
  if (!options.enabled) return undefined;
  if (scanner?.name() !== 'bitcoin-cash') throw new Error('Enabled BCH scanner is unavailable');
  return new ScannerSyncHealthCheckParam(
    scanner.name(),
    () => getLastSavedBlock(scanner.name()),
    options.scanner.warnDiff,
    options.scanner.criticalDiff,
    600,
    options.scanner.intervalMs / 1000,
  );
};
