import { DefaultLogger } from '@rosen-bridge/abstract-logger';
import {
  FailoverStrategy,
  NetworkConnectorManager,
} from '@rosen-bridge/abstract-scanner';
import {
  BitcoinRpcObservationExtractor,
  BitcoinEsploraObservationExtractor,
} from '@rosen-bridge/bitcoin-observation-extractor';
import {
  AbstractRunesProtocolNetwork,
  BitcoinRunesEsploraObservationExtractor,
  BitcoinRunesRpcObservationExtractor,
  UnisatRunesProtocolNetwork,
} from '@rosen-bridge/bitcoin-runes-observation-extractor';
import {
  BitcoinRpcNetwork,
  BitcoinRpcScanner,
  BitcoinEsploraScanner,
  EsploraNetwork,
  BitcoinRpcTransaction,
  BitcoinEsploraTransaction,
} from '@rosen-bridge/bitcoin-scanner';
import { DataSource } from '@rosen-bridge/extended-typeorm';

import { configs } from '../configs';
import { TokensConfig } from '../tokensConfig';

const logger = DefaultLogger.getInstance().child(import.meta.url);

/**
 * Initializes and configures a Bitcoin RPC scanner instance.
 *
 * @param dataSource - TypeORM DataSource for DB connection
 * @returns Configured and ready-to-use BitcoinScanner instance
 * @throws Error if observation extractor creation or registration fails
 */
export const buildBitcoinRpcScannerWithExtractors = async (
  dataSource: DataSource,
) => {
  logger.info('Starting Bitcoin scanner initialization...');

  // Create Bitcoin scanner with RPC network settings
  const networkConnectorManager =
    new NetworkConnectorManager<BitcoinRpcTransaction>(
      new FailoverStrategy(),
      logger.child('bitcoinRpcScannerLogger'),
    );
  configs.chains.bitcoin.rpc.connections.forEach((rpc) => {
    networkConnectorManager.addConnector(
      new BitcoinRpcNetwork(
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
  const bitcoinScanner = new BitcoinRpcScanner({
    dataSource: dataSource,
    initialHeight: configs.chains.bitcoin.initialHeight,
    network: networkConnectorManager,
    blockRetrieveGap: configs.chains.bitcoin.blockRetrieveGap,
    logger: logger.child('bitcoinRpcScannerLogger'),
  });

  try {
    const tokenMap = TokensConfig.getInstance().getTokenMap();
    if (configs.chains.bitcoin.active) {
      logger.debug('Creating Bitcoin observation extractor...');
      const observationExtractor = new BitcoinRpcObservationExtractor(
        configs.contracts.bitcoin.addresses.lock,
        dataSource,
        tokenMap,
        logger.child('bitcoinRpcObservationExtractor'),
      );

      logger.debug('Registering observation extractor with scanner...');
      await bitcoinScanner.registerExtractor(observationExtractor);
      logger.info('Bitcoin observation extractor registered successfully');
    }
    if (configs.chains['bitcoin-runes'].active) {
      const runesClient: AbstractRunesProtocolNetwork =
        new UnisatRunesProtocolNetwork(
          configs.chains['bitcoin-runes'].unisatUrl!,
          configs.chains['bitcoin-runes'].unisatApiKey!,
          logger.child('runesClient'),
        );
      logger.debug('Creating Bitcoin Runes RPC observation extractor...');
      const runesObservationExtractor = new BitcoinRunesRpcObservationExtractor(
        configs.contracts['bitcoin-runes'].addresses.lock,
        runesClient,
        dataSource,
        tokenMap,
        logger.child('bitcoinRunesRpcObservationExtractor'),
      );
      await bitcoinScanner.registerExtractor(runesObservationExtractor);
      logger.info(
        'Bitcoin Runes RPC observation extractor registered successfully',
      );
    }
  } catch (error) {
    logger.error(
      `Failed to create or register Bitcoin observation extractor: ${error instanceof Error ? error.message : error}`,
    );
    if (error instanceof Error && error.stack) {
      logger.debug(error.stack);
    }
  }

  logger.info('Bitcoin scanner initialization completed successfully');
  return bitcoinScanner;
};

/**
 * Initializes and configures a Bitcoin Esplora scanner instance.
 *
 * @param dataSource - TypeORM DataSource for DB connection
 * @returns Configured and ready-to-use BitcoinScanner instance
 * @throws Error if observation extractor creation or registration fails
 */
export const buildBitcoinEsploraScannerWithExtractors = async (
  dataSource: DataSource,
) => {
  logger.info('Starting Bitcoin scanner initialization...');

  // Create Bitcoin scanner with Esplora network settings
  const networkConnectorManager =
    new NetworkConnectorManager<BitcoinEsploraTransaction>(
      new FailoverStrategy(),
      logger.child('bitcoinEsploraScannerLogger'),
    );
  configs.chains.bitcoin.esplora.connections.forEach((esplora) => {
    networkConnectorManager.addConnector(
      new EsploraNetwork(
        esplora.url!,
        esplora.timeout! * 1000,
        esplora.apiPrefix,
      ),
    );
  });
  const bitcoinScanner = new BitcoinEsploraScanner({
    dataSource: dataSource,
    initialHeight: configs.chains.bitcoin.initialHeight,
    network: networkConnectorManager,
    blockRetrieveGap: configs.chains.bitcoin.blockRetrieveGap,
    logger: logger.child('bitcoinEsploraScannerLogger'),
  });

  try {
    const tokenMap = TokensConfig.getInstance().getTokenMap();
    if (configs.chains.bitcoin.active) {
      logger.debug('Creating Bitcoin observation extractor...');
      const observationExtractor = new BitcoinEsploraObservationExtractor(
        configs.contracts.bitcoin.addresses.lock,
        dataSource,
        tokenMap,
        logger.child('bitcoinEsploraObservationExtractor'),
      );

      logger.debug('Registering observation extractor with scanner...');
      await bitcoinScanner.registerExtractor(observationExtractor);
      logger.info('Bitcoin observation extractor registered successfully');
    }
    if (configs.chains['bitcoin-runes'].active) {
      const runesClient: AbstractRunesProtocolNetwork =
        new UnisatRunesProtocolNetwork(
          configs.chains['bitcoin-runes'].unisatUrl!,
          configs.chains['bitcoin-runes'].unisatApiKey!,
          logger.child('runesClient'),
        );
      logger.debug('Creating Bitcoin Runes Esplora observation extractor...');

      const runsObservationExtractor =
        new BitcoinRunesEsploraObservationExtractor(
          configs.contracts['bitcoin-runes'].addresses.lock,
          runesClient,
          dataSource,
          tokenMap,
          logger.child('bitcoinRunesEsploraObservationExtractor'),
        );

      logger.info(
        'Bitcoin Runes Esplora observation extractor registered successfully',
      );
      await bitcoinScanner.registerExtractor(runsObservationExtractor);
    }
  } catch (error) {
    logger.error(
      `Failed to create or register Bitcoin observation extractor: ${error instanceof Error ? error.message : error}`,
    );
    if (error instanceof Error && error.stack) {
      logger.debug(error.stack);
    }
  }

  logger.info('Bitcoin scanner initialization completed successfully');
  return bitcoinScanner;
};
