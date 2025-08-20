import {
  DogeEsploraScanner,
  EsploraNetwork,
} from '@rosen-bridge/bitcoin-esplora-scanner';
import {
  DogeRpcObservationExtractor,
  DogeEsploraObservationExtractor,
} from '@rosen-bridge/bitcoin-observation-extractor';
import {
  DogeRpcNetwork,
  DogeRpcScanner,
  DogeRpcTransaction,
} from '@rosen-bridge/bitcoin-rpc-scanner';
import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import {
  FailoverStrategy,
  NetworkConnectorManager,
} from '@rosen-bridge/scanner';

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
      new FailoverStrategy(),
      logger,
    );
  configs.chains.doge.rpc.forEach((rpc) => {
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
    suffix: configs.chains.doge.rpcSuffix,
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
  const dogeScanner = new DogeEsploraScanner({
    dataSource: dataSource,
    initialHeight: configs.chains.doge.initialHeight,
    network: new EsploraNetwork(
      configs.chains.doge.esplora.url!,
      configs.chains.doge.esplora.timeout! * 1000,
      configs.chains.doge.esplora.apiPrefix,
    ),
    blockRetrieveGap: configs.chains.doge.blockRetrieveGap,
    suffix: configs.chains.doge.esplora.suffix,
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
  }

  logger.info('Doge scanner initialization completed successfully');
  return dogeScanner;
};
