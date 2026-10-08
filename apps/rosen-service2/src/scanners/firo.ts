import { DefaultLogger } from '@rosen-bridge/abstract-logger';
import { FailoverStrategy, NetworkConnectorManager } from '@rosen-bridge/abstract-scanner';
import type { TokenMap } from '@rosen-bridge/extended-tokens';
import type { DataSource } from '@rosen-bridge/extended-typeorm';
import { FiroObservationExtractor } from '@rosen-bridge/firo-observation-extractor';
import {
  FiroElectrumXNetwork,
  FiroElectrumXScanner,
  FiroRpcNetwork,
  FiroRpcScanner,
  type FiroRpcTransaction,
} from '@rosen-bridge/firo-scanner';

import { configs } from '../configs';
import { FIRO_METHOD_ELECTRUMX, FIRO_METHOD_RPC } from '../constants';

const logger = DefaultLogger.getInstance().child(import.meta.url);

/**
 * Creates and configures a Firo electrumx network connector manager.
 *
 * @returns Configured Firo network connector manager
 */
export const createFiroElectrumxNetworkConnectorManager = () => {
  const networkConnectorManager = new NetworkConnectorManager<FiroRpcTransaction>(
    new FailoverStrategy(),
    logger.child('firoElectrumxNetworkConnector'),
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
 * Creates and configures a Firo RPC network connector manager.
 *
 * @returns Configured Firo network connector manager
 */
export const createFiroRpcNetworkConnectorManager = () => {
  const networkConnectorManager = new NetworkConnectorManager<FiroRpcTransaction>(
    new FailoverStrategy(),
    logger.child('firoRpcNetworkConnector'),
  );
  configs.chains.firo.rpc.connections.forEach((rpc) => {
    if (rpc.url && rpc.timeout) {
      networkConnectorManager.addConnector(
        new FiroRpcNetwork(
          rpc.url,
          rpc.timeout * 1000,
          rpc.username && rpc.password
            ? {
                username: rpc.username,
                password: rpc.password,
              }
            : undefined,
        ),
      );
    }
  });
  return networkConnectorManager;
};

/**
 * Initializes and configures a Firo electrumX scanner instance.
 *
 * @param dataSource - TypeORM DataSource for DB connection
 * @param tokenMap
 * @returns Configured and ready-to-use FiroScanner instance
 * @throws Error if observation extractor creation or registration fails
 */
const buildFiroElectrumxScannerWithExtractors = async (
  dataSource: DataSource,
  tokenMap: TokenMap,
) => {
  logger.info('Starting Firo electrumx scanner initialization...');

  const firoScanner = new FiroElectrumXScanner({
    dataSource,
    initialHeight: configs.chains.firo.initialHeight || 1,
    network: createFiroElectrumxNetworkConnectorManager(),
    blockRetrieveGap: configs.chains.firo.blockRetrieveGap,
    blockCleanupConfig: { active: configs.chains.firo.blockCleanupActive === true },
    logger: logger.child('firoScannerLogger'),
  });
  try {
    logger.debug('Creating Firo observation extractor...');
    const observationExtractor = new FiroObservationExtractor(
      configs.contracts.firo.addresses.lock,
      dataSource,
      tokenMap,
      logger.child('firoObservationExtractor'),
    );

    logger.debug('Registering observation extractor with scanner...');
    await firoScanner.registerExtractor(observationExtractor);
    logger.info('firo observation extractor registered successfully');
  } catch (error) {
    logger.error(
      `Failed to create or register Firo observation extractor: ${error instanceof Error ? error.message : error}`,
    );
    if (error instanceof Error && error.stack) {
      logger.debug(error.stack);
    }
  }
  logger.info('Frio scanner initialization completed successfully');
  return firoScanner;
};

/**
 * Initializes and configures a Firo RPC scanner instance.
 *
 * @param dataSource - TypeORM DataSource for DB connection
 * @param tokenMap
 * @returns Configured and ready-to-use FiroScanner instance
 * @throws Error if observation extractor creation or registration fails
 */
const buildFiroRpcScannerWithExtractors = async (dataSource: DataSource, tokenMap: TokenMap) => {
  logger.info('Starting Firo rpc scanner initialization...');

  const firoScanner = new FiroRpcScanner({
    dataSource,
    initialHeight: configs.chains.firo.initialHeight || 1,
    network: createFiroRpcNetworkConnectorManager(),
    blockRetrieveGap: configs.chains.firo.blockRetrieveGap,
    blockCleanupConfig: { active: configs.chains.firo.blockCleanupActive === true },
    logger: logger.child('firoScannerLogger'),
  });
  try {
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
  } catch (error) {
    logger.error(
      `Failed to create or register Firo observation extractor: ${error instanceof Error ? error.message : error}`,
    );
    if (error instanceof Error && error.stack) {
      logger.debug(error.stack);
    }
  }
  logger.info('Frio scanner initialization completed successfully');
  return firoScanner;
};

/**
 * Creates a Firo scanner.
 *
 * @param dataSource - TypeORM DataSource for database connection
 * @param tokenMap
 * @returns {FiroElectrumXScanner | FiroRpcScanner}
 * @throws Error if observation extractor creation or registration fails
 */
export const getFiroScanner = async (
  dataSource: DataSource,
  tokenMap: TokenMap,
): Promise<FiroElectrumXScanner | FiroRpcScanner> => {
  switch (configs.chains.firo.method) {
    case FIRO_METHOD_ELECTRUMX:
      return await buildFiroElectrumxScannerWithExtractors(dataSource, tokenMap);
    case FIRO_METHOD_RPC:
      return await buildFiroRpcScannerWithExtractors(dataSource, tokenMap);
    default:
      throw new Error(`Unsupported or missing Firo scanner method`);
  }
};
