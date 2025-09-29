import {
  FailoverStrategy,
  NetworkConnectorManager,
} from '@rosen-bridge/abstract-scanner';
import {
  BitcoinRpcNetwork,
  BitcoinRpcScanner,
  BitcoinRpcTransaction,
} from '@rosen-bridge/bitcoin-scanner';
import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';

import config from '../../configs';
import {
  BITCOIN_SCANNER_INTERVAL,
  BITCOIN_SCANNER_LOGGER_NAME,
  SCANNER_API_TIMEOUT,
} from '../../constants';
import dataSource from '../../data-source';
import AppError from '../../errors/AppError';
import observationService from '../../observation/observation-service';
import { startScanner } from '../scanner-utils';

const logger = CallbackLoggerFactory.getInstance().getLogger(import.meta.url);
const scannerLogger = CallbackLoggerFactory.getInstance().getLogger(
  BITCOIN_SCANNER_LOGGER_NAME,
);

/**
 * Creates and configures a NetworkConnectorManager instance for bitcoin scanner
 */
export const createBitcoinNetworkConnectorManager = () => {
  const networkConnectorManager =
    new NetworkConnectorManager<BitcoinRpcTransaction>(
      new FailoverStrategy(),
      scannerLogger,
    );

  networkConnectorManager.addConnector(
    new BitcoinRpcNetwork(
      config.bitcoin.rpcUrl,
      SCANNER_API_TIMEOUT * 1000,
      config.bitcoin.rpcUsername && config.bitcoin.rpcPassword
        ? {
            username: config.bitcoin.rpcUsername,
            password: config.bitcoin.rpcPassword,
          }
        : undefined,
    ),
  );

  return networkConnectorManager;
};

/**
 * create a bitcoin scanner, initializing it and calling its update method
 * periodically
 */
export const startBitcoinScanner = async () => {
  try {
    const scanner = new BitcoinRpcScanner({
      dataSource,
      initialHeight: config.bitcoin.initialHeight,
      logger: scannerLogger,
      network: createBitcoinNetworkConnectorManager(),
    });

    await observationService.registerBitcoinExtractor(scanner);
    await observationService.registerBitcoinRunesExtractor(scanner);

    startScanner(scanner, import.meta.url, BITCOIN_SCANNER_INTERVAL);

    logger.debug('bitcoin scanner started');

    return scanner;
  } catch (error) {
    throw new AppError(
      `cannot create or start bitcoin scanner due to error: ${error}`,
      false,
      'error',
      error instanceof Error ? error.stack : undefined,
    );
  }
};
