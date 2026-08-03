import type { TransactionResponse } from 'ethers';

import { DefaultLogger } from '@rosen-bridge/abstract-logger';
import {
  FailoverStrategy,
  NetworkConnectorManager,
} from '@rosen-bridge/abstract-scanner';
import { EvmRpcNetwork, EvmRpcScanner } from '@rosen-bridge/evm-scanner';

import config from '../../configs';
import {
  ETHEREUM_SCANNER_INTERVAL,
  ETHEREUM_SCANNER_LOGGER_NAME,
  SCANNER_API_TIMEOUT,
} from '../../constants';
import dataSource from '../../data-source';
import AppError from '../../errors/AppError';
import observationService from '../../observation/observation-service';
import { startScanner } from '../scanner-utils';

const logger = DefaultLogger.getInstance().child(import.meta.url);
const scannerLogger = logger.child(ETHEREUM_SCANNER_LOGGER_NAME);

/**
 * Creates and configures a NetworkConnectorManager instance for ethereum scanner
 */
export const createEthereumNetworkConnectorManager = () => {
  const networkConnectorManager =
    new NetworkConnectorManager<TransactionResponse>(
      new FailoverStrategy(),
      scannerLogger,
    );

  networkConnectorManager.addConnector(
    new EvmRpcNetwork(
      config.ethereum.rpcUrl,
      SCANNER_API_TIMEOUT * 1000,
      config.ethereum.rpcAuthToken,
    ),
  );

  return networkConnectorManager;
};

/**
 * create a ethereum scanner, initializing it and calling its update method
 * periodically
 */
export const startEthereumScanner = async () => {
  try {
    const scanner = new EvmRpcScanner('ethereum', {
      dataSource,
      initialHeight: config.ethereum.initialHeight,
      logger: scannerLogger,
      network: createEthereumNetworkConnectorManager(),
    });

    await observationService.registerEthereumExtractor(scanner);

    startScanner(scanner, import.meta.url, ETHEREUM_SCANNER_INTERVAL);

    logger.debug('ethereum scanner started');

    return scanner;
  } catch (error) {
    throw new AppError(
      `cannot create or start ethereum scanner due to error: ${error}`,
      false,
      'error',
      error instanceof Error ? error.stack : undefined,
    );
  }
};
