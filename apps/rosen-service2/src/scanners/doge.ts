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
import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';

import { configs } from '../configs';
import { TokensConfig } from '../tokensConfig';

const logger = CallbackLoggerFactory.getInstance().getLogger(import.meta.url);

/**
 * Initializes and configures a Doge Rpc scanner instance.
 *
 * @param dataSource - TypeORM DataSource for database connection
 * @returns Configured and ready-to-use DogeScanner instance
 * @throws Error if observation extractor creation or registration fails
 */
export const buildDogeRpcScannerWithExtractors = async (
  dataSource: DataSource,
) => {
  logger.info('Starting Doge scanner initialization...');

  // Create Doge scanner with RPC network settings
  const networkConnectorManager =
    new NetworkConnectorManager<DogeRpcTransaction>(
      new RoundRobinStrategy(),
      logger,
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
    logger: CallbackLoggerFactory.getInstance().getLogger(
      'doge-scanner-logger',
    ),
  });

  try {
    const tokenMap = TokensConfig.getInstance().getTokenMap();
    logger.debug('Creating Doge observation extractor...');
    const observationExtractor = new DogeRpcObservationExtractor(
      configs.contracts.doge.addresses.lock,
      dataSource,
      tokenMap,
      CallbackLoggerFactory.getInstance().getLogger(
        'doge-observation-extractor',
      ),
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
 * @returns Configured and ready-to-use DogeScanner instance
 * @throws Error if observation extractor creation or registration fails
 */
export const buildDogeEsploraScannerWithExtractors = async (
  dataSource: DataSource,
) => {
  logger.info('Starting Doge scanner initialization...');

  // Create Doge scanner with Esplora network settings
  const networkConnectorManager =
    new NetworkConnectorManager<BitcoinEsploraTransaction>(
      new RoundRobinStrategy(),
      logger,
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
    logger: CallbackLoggerFactory.getInstance().getLogger(
      'doge-scanner-logger',
    ),
  });

  try {
    const tokenMap = TokensConfig.getInstance().getTokenMap();
    logger.debug('Creating Doge observation extractor...');
    const observationExtractor = new DogeEsploraObservationExtractor(
      configs.contracts.doge.addresses.lock,
      dataSource,
      tokenMap,
      CallbackLoggerFactory.getInstance().getLogger(
        'doge-observation-extractor',
      ),
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
