import { DefaultLogger } from '@rosen-bridge/abstract-logger';
import {
  FailoverStrategy,
  NetworkConnectorManager,
} from '@rosen-bridge/abstract-scanner';
import {
  FiroElectrumXNetwork,
  FiroElectrumXScanner,
  FiroRpcTransaction,
} from '@rosen-bridge/firo-scanner';

import config from '../../configs';
import {
  FIRO_SCANNER_INTERVAL,
  FIRO_SCANNER_LOGGER_NAME,
  SCANNER_API_TIMEOUT,
} from '../../constants';
import dataSource from '../../data-source';
import AppError from '../../errors/AppError';
import observationService from '../../observation/observation-service';
import { startScanner } from '../scanner-utils';

const logger = DefaultLogger.getInstance().child(import.meta.url);
const scannerLogger = logger.child(FIRO_SCANNER_LOGGER_NAME);

/**
 * Creates and configures a NetworkConnectorManager instance for firo scanner
 */
export const createFiroNetworkConnectorManager = () => {
  const networkConnectorManager =
    new NetworkConnectorManager<FiroRpcTransaction>(
      new FailoverStrategy(),
      scannerLogger,
    );

  networkConnectorManager.addConnector(
    new FiroElectrumXNetwork(
      config.firo.electrumxHost,
      config.firo.electrumxPort,
      config.firo.electrumxReconnectDelay,
      SCANNER_API_TIMEOUT / 1000,
    ),
  );

  return networkConnectorManager;
};

/**
 * create a firo scanner, initializing it and calling its update method
 * periodically
 */
export const startFiroScanner = async () => {
  try {
    const scanner = new FiroElectrumXScanner({
      dataSource,
      initialHeight: config.firo.initialHeight,
      logger: scannerLogger,
      network: createFiroNetworkConnectorManager(),
    });

    await observationService.registerFiroExtractor(scanner);

    startScanner(scanner, import.meta.url, FIRO_SCANNER_INTERVAL);

    logger.debug('firo scanner started');

    return scanner;
  } catch (error) {
    throw new AppError(
      `cannot create or start firo scanner due to error: ${error}`,
      false,
      'error',
      error instanceof Error ? error.stack : undefined,
    );
  }
};
