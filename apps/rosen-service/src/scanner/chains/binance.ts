import type { TransactionResponse } from 'ethers';

import { DefaultLogger } from '@rosen-bridge/abstract-logger';
import {
  FailoverStrategy,
  NetworkConnectorManager,
} from '@rosen-bridge/abstract-scanner';
import { EvmRpcNetwork, EvmRpcScanner } from '@rosen-bridge/evm-scanner';

import config from '../../configs';
import {
  BINANCE_SCANNER_INTERVAL,
  BINANCE_SCANNER_LOGGER_NAME,
  SCANNER_API_TIMEOUT,
} from '../../constants';
import dataSource from '../../data-source';
import AppError from '../../errors/AppError';
import observationService from '../../observation/observation-service';
import { startScanner } from '../scanner-utils';

const logger = DefaultLogger.getInstance().child(import.meta.url);
const scannerLogger = logger.child(BINANCE_SCANNER_LOGGER_NAME);

/**
 * Creates and configures a NetworkConnectorManager instance for binance scanner
 */
export const createBinanceNetworkConnectorManager = () => {
  const networkConnectorManager =
    new NetworkConnectorManager<TransactionResponse>(
      new FailoverStrategy(),
      scannerLogger,
    );

  networkConnectorManager.addConnector(
    new EvmRpcNetwork(
      config.binance.rpcUrl,
      SCANNER_API_TIMEOUT * 1000,
      config.binance.rpcAuthToken,
    ),
  );

  return networkConnectorManager;
};

/**
 * create a binance scanner, initializing it and calling its update method
 * periodically
 */
export const startBinanceScanner = async () => {
  try {
    const scanner = new EvmRpcScanner('binance', {
      dataSource,
      initialHeight: config.binance.initialHeight,
      logger: scannerLogger,
      network: createBinanceNetworkConnectorManager(),
    });

    await observationService.registerBinanceExtractor(scanner);

    startScanner(scanner, import.meta.url, BINANCE_SCANNER_INTERVAL);

    logger.debug('binance scanner started');

    return scanner;
  } catch (error) {
    throw new AppError(
      `cannot create or start binance scanner due to error: ${error}`,
      false,
      'error',
      error instanceof Error ? error.stack : undefined,
    );
  }
};
