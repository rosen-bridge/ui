import { DefaultLogger } from '@rosen-bridge/abstract-logger';
import {
  FailoverStrategy,
  NetworkConnectorManager,
} from '@rosen-bridge/abstract-scanner';
import {
  HandshakeRpcNetwork,
  HandshakeRpcScanner,
  HandshakeRpcTransaction,
} from '@rosen-bridge/handshake-scanner';

import config from '../../configs';
import {
  HANDSHAKE_SCANNER_INTERVAL,
  HANDSHAKE_SCANNER_LOGGER_NAME,
  SCANNER_API_TIMEOUT,
} from '../../constants';
import dataSource from '../../data-source';
import AppError from '../../errors/AppError';
import observationService from '../../observation/observation-service';
import { startScanner } from '../scanner-utils';

const logger = DefaultLogger.getInstance().child(import.meta.url);
const scannerLogger = logger.child(HANDSHAKE_SCANNER_LOGGER_NAME);

/**
 * Creates and configures a NetworkConnectorManager instance for handshake scanner
 */
export const createHandshakeNetworkConnectorManager = () => {
  const networkConnectorManager =
    new NetworkConnectorManager<HandshakeRpcTransaction>(
      new FailoverStrategy(),
      scannerLogger,
    );

  networkConnectorManager.addConnector(
    new HandshakeRpcNetwork(
      config.handshake.rpcUrl,
      SCANNER_API_TIMEOUT * 1000,
    ),
  );

  return networkConnectorManager;
};

/**
 * create a handshake scanner, initializing it and calling its update method
 * periodically
 */
export const startHandshakeScanner = async () => {
  try {
    const scanner = new HandshakeRpcScanner({
      dataSource,
      initialHeight: config.handshake.initialHeight,
      logger: scannerLogger,
      network: createHandshakeNetworkConnectorManager(),
    });

    await observationService.registerHandshakeExtractor(scanner);

    startScanner(scanner, import.meta.url, HANDSHAKE_SCANNER_INTERVAL);

    logger.debug('handshake scanner started');

    return scanner;
  } catch (error) {
    throw new AppError(
      `cannot create or start handshake scanner due to error: ${error}`,
      false,
      'error',
      error instanceof Error ? error.stack : undefined,
    );
  }
};
