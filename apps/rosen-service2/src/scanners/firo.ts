import { DefaultLogger } from '@rosen-bridge/abstract-logger';
import { FailoverStrategy, NetworkConnectorManager } from '@rosen-bridge/abstract-scanner';
import type { TokenMap } from '@rosen-bridge/extended-tokens';
import type { DataSource } from '@rosen-bridge/extended-typeorm';
import { FiroObservationExtractor } from '@rosen-bridge/firo-observation-extractor';
import {
  FiroElectrumXNetwork,
  FiroElectrumXScanner,
  type FiroRpcTransaction,
} from '@rosen-bridge/firo-scanner';

import { configs } from '../configs';

const logger = DefaultLogger.getInstance().child(import.meta.url);

/**
 * Creates and configures a Firo network connector manager.
 *
 * @returns Configured Firo network connector manager
 */
export const createFiroNetworkConnectorManager = () => {
  const networkConnectorManager = new NetworkConnectorManager<FiroRpcTransaction>(
    new FailoverStrategy(),
    logger.child('firoNetworkConnector'),
  );
  const networkConfigs = configs.chains.firo.electrumx;
  if (networkConfigs.host && networkConfigs.port) {
    const network = new FiroElectrumXNetwork(
      networkConfigs.host,
      networkConfigs.port,
      networkConfigs.reconnectDelay,
      networkConfigs.timeout,
      logger.child(`firoElectrumXNetwork`),
    );
    network.setupSocket();
    networkConnectorManager.addConnector(network);
  }
  return networkConnectorManager;
};

/**
 * Creates and configures a Firo scanner instance.
 *
 * @param dataSource - TypeORM DataSource for DB connection
 * @param tokenMap
 * @returns Configured and ready-to-use FiroScanner instance
 * @throws Error if observation extractor creation or registration fails
 */
export const getFiroScanner = async (dataSource: DataSource, tokenMap: TokenMap) => {
  logger.info('Starting Firo scanner initialization...');

  try {
    const firoScanner = new FiroElectrumXScanner({
      dataSource,
      initialHeight: configs.chains.firo.initialHeight,
      logger: logger.child('firoScannerLogger'),
      network: createFiroNetworkConnectorManager(),
    });

    logger.debug('Creating Firo observation extractor...');
    const observationExtractor = new FiroObservationExtractor(
      configs.contracts.firo.addresses.lock,
      dataSource,
      tokenMap,
      logger.child('firoObservationExtractor'),
    );

    logger.debug('Registering observation extractor with scanner...');
    await firoScanner.registerExtractor(observationExtractor);
    logger.info('Firo scanner initialized successfully and observation extractor registered');

    return firoScanner;
  } catch (error) {
    logger.error(
      `Failed to create or register Firo observation extractor: ${error instanceof Error ? error.message : error}`,
    );
    if (error instanceof Error && error.stack) {
      logger.debug(error.stack);
    }
  }
};
