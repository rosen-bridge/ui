import { DefaultLogger } from '@rosen-bridge/abstract-logger';
import { FailoverStrategy, NetworkConnectorManager } from '@rosen-bridge/abstract-scanner';
import {
  BitcoinCashRpcNetwork,
  BitcoinCashRpcScanner,
  type BitcoinCashRpcTransaction,
} from '@rosen-bridge/bitcoin-cash-scanner';

import type { BitcoinCashServiceConfig } from '../../bitcoin-cash/config';
import config from '../../configs';
import dataSource from '../../data-source';
import { registerBitcoinCashExtractor } from '../../observation/chains/bitcoin-cash';
import { startScanner } from '../scanner-utils';

/**
 * Starts BCH scanning only after complete explicit configuration passes its guard.
 * @param options Validated service configuration; disabled by default.
 * @returns Initialized BCH scanner, or undefined without client construction when disabled.
 * @throws Error With a fixed message if extractor registration or initial startup fails.
 */
export const startBitcoinCashScanner = async (
  options: BitcoinCashServiceConfig = config.bitcoinCash,
): Promise<BitcoinCashRpcScanner | undefined> => {
  if (!options.enabled) return undefined;
  try {
    const logger = DefaultLogger.getInstance().child('bitcoinCashScanner');
    const network = new NetworkConnectorManager<BitcoinCashRpcTransaction>(
      new FailoverStrategy(),
      logger,
    );
    network.addConnector(
      new BitcoinCashRpcNetwork(
        options.rpc.url,
        options.rpc.timeoutMs,
        'main',
        options.rpc.username !== undefined && options.rpc.password !== undefined
          ? { username: options.rpc.username, password: options.rpc.password }
          : undefined,
        options.rpc.limits,
      ),
    );
    const scanner = new BitcoinCashRpcScanner({
      dataSource,
      initialHeight: options.initialHeight,
      logger,
      network,
      blockCleanupConfig: {
        blockCleanupThresholdDuration: options.cleanup.thresholdSeconds,
        blockTrimCountInRound: options.cleanup.trimCount,
      },
    });
    await registerBitcoinCashExtractor(scanner, options);
    await startScanner(scanner, import.meta.url, options.scanner.intervalMs);
    return scanner;
  } catch {
    throw new Error('BCH scanner initialization failed');
  }
};
