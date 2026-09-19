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

  const network = new FiroElectrumXNetwork(
    configs.chains.firo.electrumx.host,
    configs.chains.firo.electrumx.port,
    configs.chains.firo.electrumx.reconnectDelay,
    configs.chains.firo.electrumx.timeout / 1000,
    logger.child(`firoElectrumXNetwork`),
  );
  network.setupSocket();
  networkConnectorManager.addConnector(network);

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
    logger.info('Firo observation extractor registered successfully');

    logger.info('Firo scanner initialization completed successfully');
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
