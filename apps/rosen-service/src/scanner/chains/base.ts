import { DefaultLogger } from '@rosen-bridge/abstract-logger';
import {
  FailoverStrategy,
  NetworkConnectorManager,
} from '@rosen-bridge/abstract-scanner';
import { EvmRpcNetwork, EvmRpcScanner } from '@rosen-bridge/evm-scanner';
import { TransactionResponse } from 'ethers';

import config from '../../configs';
import {
  BASE_SCANNER_INTERVAL,
  BASE_SCANNER_LOGGER_NAME,
  SCANNER_API_TIMEOUT,
} from '../../constants';
import dataSource from '../../data-source';
import AppError from '../../errors/AppError';
import observationService from '../../observation/observation-service';
import { startScanner } from '../scanner-utils';

const logger = DefaultLogger.getInstance().child(import.meta.url);
const scannerLogger = logger.child(BASE_SCANNER_LOGGER_NAME);

/**
 * Creates and configures a NetworkConnectorManager instance for base scanner
 */
export const createBaseNetworkConnectorManager = () => {
  const networkConnectorManager =
    new NetworkConnectorManager<TransactionResponse>(
      new FailoverStrategy(),
      scannerLogger,
    );

  networkConnectorManager.addConnector(
    new EvmRpcNetwork(
      config.base.rpcUrl,
      SCANNER_API_TIMEOUT * 1000,
      config.base.rpcAuthToken,
    ),
  );

  return networkConnectorManager;
};

/**
 * create a base scanner, initializing it and calling its update method
 * periodically
 */
export const startBaseScanner = async () => {
  try {
    const scanner = new EvmRpcScanner('base', {
      dataSource,
      initialHeight: config.base.initialHeight,
      logger: scannerLogger,
      network: createBaseNetworkConnectorManager(),
    });

    await observationService.registerBaseExtractor(scanner);

    startScanner(scanner, import.meta.url, BASE_SCANNER_INTERVAL);

    logger.debug('base scanner started');

    return scanner;
  } catch (error) {
    throw new AppError(
      `cannot create or start base scanner due to error: ${error}`,
      false,
      'error',
      error instanceof Error ? error.stack : undefined,
    );
  }
};
