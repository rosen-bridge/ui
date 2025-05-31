import {
  DogeRpcNetwork,
  DogeRpcScanner,
  DogeRpcTransaction,
} from '@rosen-bridge/bitcoin-rpc-scanner';
import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';
import {
  RoundRobinStrategy,
  NetworkConnectorManager,
} from '@rosen-bridge/scanner';

import config from '../../configs';
import {
  DOGE_SCANNER_INTERVAL,
  DOGE_SCANNER_LOGGER_NAME,
  SCANNER_API_TIMEOUT,
} from '../../constants';
import dataSource from '../../data-source';
import AppError from '../../errors/AppError';
import observationService from '../../observation/observation-service';
import { startScanner } from '../scanner-utils';

const logger = CallbackLoggerFactory.getInstance().getLogger(import.meta.url);
const scannerLogger = CallbackLoggerFactory.getInstance().getLogger(
  DOGE_SCANNER_LOGGER_NAME,
);

/**
 * Creates and configures a NetworkConnectorManager instance for Doge RPC scanner
 */
export const createDogeRpcNetworkConnectorManager = () => {
  const networkConnectorManager =
    new NetworkConnectorManager<DogeRpcTransaction>(
      new RoundRobinStrategy(),
      scannerLogger,
    );
  config.doge.rpcConnections.forEach((rpcConfig) => {
    networkConnectorManager.addConnector(
      new DogeRpcNetwork(
        rpcConfig.url,
        SCANNER_API_TIMEOUT * 1000,
        rpcConfig.username && rpcConfig.password
          ? {
              username: rpcConfig.username,
              password: rpcConfig.password,
            }
          : undefined,
      ),
    );
  });

  return networkConnectorManager;
};

/**
 * create a dogecoin scanner, initializing it and calling its update method
 * periodically
 */
export const startDogeScanner = async () => {
  try {
    const scanner = new DogeRpcScanner({
      dataSource,
      initialHeight: config.doge.initialHeight,
      logger: scannerLogger,
      network: createDogeRpcNetworkConnectorManager(),
      blockRetrieveGap: config.doge.blockRetrieveGap,
    });

    observationService.registerDogeExtractor(scanner);

    startScanner(scanner, import.meta.url, DOGE_SCANNER_INTERVAL);

    logger.debug('doge scanner started');

    return scanner;
  } catch (error) {
    throw new AppError(
      `cannot create or start doge scanner due to error: ${error}`,
      false,
      'error',
      error instanceof Error ? error.stack : undefined,
    );
  }
};
