import { DefaultLogger } from '@rosen-bridge/abstract-logger';
import {
  NetworkConnectorManager,
  RoundRobinStrategy,
} from '@rosen-bridge/abstract-scanner';
import {
  DogeRpcObservationExtractor,
  DogeEsploraObservationExtractor,
} from '@rosen-bridge/bitcoin-observation-extractor';
import {
  DogeEsploraScanner,
  EsploraNetwork,
  DogeRpcNetwork,
  DogeRpcScanner,
  DogeRpcTransaction,
  BitcoinEsploraTransaction,
} from '@rosen-bridge/bitcoin-scanner';
import { TokenMap } from '@rosen-bridge/extended-tokens';
import { DataSource } from '@rosen-bridge/extended-typeorm';

import { configs } from '../configs';
import { DOGE_METHOD_ESPLORA, DOGE_METHOD_RPC } from '../constants';

const logger = DefaultLogger.getInstance().child(import.meta.url);

/**
 * Initializes and configures a Doge Rpc scanner instance.
 *
 * @param dataSource - TypeORM DataSource for database connection
 * @param tokenMap
 * @returns Configured and ready-to-use DogeScanner instance
 * @throws Error if observation extractor creation or registration fails
 */
const buildDogeRpcScannerWithExtractors = async (
  dataSource: DataSource,
  tokenMap: TokenMap,
) => {
  logger.info('Starting Doge scanner initialization...');

  // Create Doge scanner with RPC network settings
  const networkConnectorManager =
    new NetworkConnectorManager<DogeRpcTransaction>(
      new RoundRobinStrategy(),
      logger.child('dogeRpcObservationExtractor'),
    );
  configs.chains.doge.rpc.connections.forEach((rpc) => {
    networkConnectorManager.addConnector(
      new DogeRpcNetwork(
        rpc.url!,
        rpc.timeout! * 1000,
        rpc.username && rpc.password
          ? {
              username: rpc.username,
              password: rpc.password,
            }
          : undefined,
      ),
    );
  });
  const dogeScanner = new DogeRpcScanner({
    dataSource: dataSource,
    initialHeight: configs.chains.doge.initialHeight,
    network: networkConnectorManager,
    blockRetrieveGap: configs.chains.doge.blockRetrieveGap,
    logger: logger.child('dogeRpcScannerLogger'),
  });

  try {
    logger.debug('Creating Doge observation extractor...');
    const observationExtractor = new DogeRpcObservationExtractor(
      configs.contracts.doge.addresses.lock,
      dataSource,
      tokenMap,
      logger.child('dogeRpcObservationExtractor'),
    );

    logger.debug('Registering observation extractor with scanner...');
    await dogeScanner.registerExtractor(observationExtractor);
    logger.info('Doge observation extractor registered successfully');
  } catch (error) {
    logger.error(
      `Failed to create or register Doge observation extractor: ${error instanceof Error ? error.message : error}`,
    );
    if (error instanceof Error && error.stack) {
      logger.debug(error.stack);
    }
  }

  logger.info('Doge scanner initialization completed successfully');
  return dogeScanner;
};

/**
 * Initializes and configures a Doge Esplora scanner instance.
 *
 * @param dataSource - TypeORM DataSource for database connection
 * @param tokenMap
 * @returns Configured and ready-to-use DogeScanner instance
 * @throws Error if observation extractor creation or registration fails
 */
const buildDogeEsploraScannerWithExtractors = async (
  dataSource: DataSource,
  tokenMap: TokenMap,
) => {
  logger.info('Starting Doge scanner initialization...');

  // Create Doge scanner with Esplora network settings
  const networkConnectorManager =
    new NetworkConnectorManager<BitcoinEsploraTransaction>(
      new RoundRobinStrategy(),
      logger.child('dogeEsploraScannerLogger'),
    );
  configs.chains.doge.esplora.connections.forEach((esplora) => {
    networkConnectorManager.addConnector(
      new EsploraNetwork(
        esplora.url!,
        esplora.timeout! * 1000,
        esplora.apiPrefix,
      ),
    );
  });
  const dogeScanner = new DogeEsploraScanner({
    dataSource: dataSource,
    initialHeight: configs.chains.doge.initialHeight,
    network: networkConnectorManager,
    blockRetrieveGap: configs.chains.doge.blockRetrieveGap,
    logger: logger.child('dogeEsploraScannerLogger'),
  });

  try {
    logger.debug('Creating Doge observation extractor...');
    const observationExtractor = new DogeEsploraObservationExtractor(
      configs.contracts.doge.addresses.lock,
      dataSource,
      tokenMap,
      logger.child('dogeEsploraObservationExtractor'),
    );

    logger.debug('Registering observation extractor with scanner...');
    await dogeScanner.registerExtractor(observationExtractor);
    logger.info('Doge observation extractor registered successfully');
  } catch (error) {
    logger.error(
      `Failed to create or register Doge observation extractor: ${error instanceof Error ? error.message : error}`,
    );
    if (error instanceof Error && error.stack) {
      logger.debug(error.stack);
    }
  }

  logger.info('Doge scanner initialization completed successfully');
  return dogeScanner;
};

/**
 * Creates a Doge scanner.
 *
 * @param dataSource - TypeORM DataSource for database connection
 * @param tokenMap
 * @returns {DogeEsploraScanner | DogeRpcScanner}
 * @throws Error if observation extractor creation or registration fails
 */
export const getDogeScanner = async (
  dataSource: DataSource,
  tokenMap: TokenMap,
): Promise<DogeEsploraScanner | DogeRpcScanner> => {
  switch (configs.chains.doge.method) {
    case DOGE_METHOD_ESPLORA:
      return await buildDogeEsploraScannerWithExtractors(dataSource, tokenMap);
    case DOGE_METHOD_RPC:
      return await buildDogeRpcScannerWithExtractors(dataSource, tokenMap);
    default:
      throw new Error(`Unsupported or missing Doge scanner method`);
  }
};
