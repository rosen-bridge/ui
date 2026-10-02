import { DefaultLogger } from '@rosen-bridge/abstract-logger';
import { BitcoinCashRpcObservationExtractor } from '@rosen-bridge/bitcoin-cash-observation-extractor';
import type { BitcoinCashRpcScanner } from '@rosen-bridge/bitcoin-cash-scanner';

import type { EnabledBitcoinCashConfig } from '../../bitcoin-cash/config';
import dataSource from '../../data-source';
import { getTokenMap } from '../../utils';

/**
 * Registers the native BCH observation extractor on its distinct scanner.
 * @param scanner Initialized BCH scanner.
 * @param options Validated enabled mainnet BCH operator configuration.
 * @returns Completion after extractor persistence is registered.
 */
export const registerBitcoinCashExtractor = async (
  scanner: BitcoinCashRpcScanner,
  options: EnabledBitcoinCashConfig,
): Promise<void> => {
  const logger = DefaultLogger.getInstance().child('bitcoinCashObservationExtractor');
  const extractor = new BitcoinCashRpcObservationExtractor(
    options.lockAddress,
    dataSource,
    await getTokenMap(),
    logger,
  );
  await scanner.registerExtractor(extractor);
};
