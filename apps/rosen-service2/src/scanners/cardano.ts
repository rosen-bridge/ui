import {
  FailoverStrategy,
  NetworkConnectorManager,
} from '@rosen-bridge/abstract-scanner';
import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';
import {
  CardanoKoiosObservationExtractor,
  CardanoBlockFrostObservationExtractor,
  CardanoOgmiosObservationExtractor,
} from '@rosen-bridge/cardano-observation-extractor';
import {
  BlockFrostNetwork,
  BlockFrostTransaction,
  CardanoBlockFrostScanner,
  CardanoKoiosScanner,
  CardanoOgmiosScanner,
  KoiosNetwork,
  KoiosTransaction,
} from '@rosen-bridge/cardano-scanner';
import { DataSource } from '@rosen-bridge/extended-typeorm';

import { configs } from '../configs';
import { TokensConfig } from '../tokensConfig';

const logger = CallbackLoggerFactory.getInstance().getLogger(import.meta.url);

/**
 * Initializes and configures a Cardano Koios scanner instance.
 *
 * @param dataSource - TypeORM DataSource for DB connection
 * @returns Configured and ready-to-use CardanoKoiosScanner instance
 * @throws Error if observation extractor creation or registration fails
 */
export const buildCardanoKoiosScannerWithExtractors = async (
  dataSource: DataSource,
) => {
  logger.info('Starting Cardano scanner initialization...');

  // Create Cardano scanner with Koios network settings
  const networkConnectorManager = new NetworkConnectorManager<KoiosTransaction>(
    new FailoverStrategy(),
    logger,
  );
  configs.chains.cardano.koios.connections.forEach((koios) => {
    networkConnectorManager.addConnector(
      new KoiosNetwork(koios.url!, koios.timeout! * 1000, koios.authToken),
    );
  });
  const cardanoScanner = new CardanoKoiosScanner({
    dataSource: dataSource,
    initialHeight: configs.chains.cardano.initialHeight!,
    network: networkConnectorManager,
    blockRetrieveGap: configs.chains.cardano.blockRetrieveGap,
    logger: CallbackLoggerFactory.getInstance().getLogger(
      'cardano-koios-scanner-logger',
    ),
  });

  try {
    const tokenMap = TokensConfig.getInstance().getTokenMap();

    logger.debug('Creating Cardano observation extractor...');
    const observationExtractor = new CardanoKoiosObservationExtractor(
      dataSource,
      tokenMap,
      configs.contracts.cardano.addresses.lock,
      CallbackLoggerFactory.getInstance().getLogger(
        'cardano-koios-observation-extractor',
      ),
    );

    logger.debug('Registering observation extractor with scanner...');
    await cardanoScanner.registerExtractor(observationExtractor);
    logger.info('Cardano observation extractor registered successfully');
  } catch (error) {
    logger.error(
      `Failed to create or register Cardano observation extractor: ${error instanceof Error ? error.message : error}`,
    );
    if (error instanceof Error && error.stack) {
      logger.debug(error.stack);
    }
  }

  logger.info('Cardano scanner initialization completed successfully');
  return cardanoScanner;
};

/**
 * Initializes and configures a Cardano BlockFrost scanner instance.
 *
 * @param dataSource - TypeORM DataSource for DB connection
 * @returns Configured and ready-to-use CardanoBlockFrostScanner instance
 * @throws Error if observation extractor creation or registration fails
 */
export const buildCardanoBlockFrostScannerWithExtractors = async (
  dataSource: DataSource,
) => {
  logger.info('Starting Cardano scanner initialization...');

  // Create Cardano scanner with BlockFrost network settings
  const networkConnectorManager =
    new NetworkConnectorManager<BlockFrostTransaction>(
      new FailoverStrategy(),
      logger,
    );
  configs.chains.cardano.blockfrost.connections.forEach((blockfrost) => {
    networkConnectorManager.addConnector(
      new BlockFrostNetwork(blockfrost.projectId!, blockfrost.url),
    );
  });
  const cardanoScanner = new CardanoBlockFrostScanner({
    dataSource: dataSource,
    initialHeight: configs.chains.cardano.initialHeight!,
    network: networkConnectorManager,
    blockRetrieveGap: configs.chains.cardano.blockRetrieveGap,
    logger: CallbackLoggerFactory.getInstance().getLogger(
      'cardano-BlockFrost-scanner-logger',
    ),
  });

  try {
    const tokenMap = TokensConfig.getInstance().getTokenMap();

    logger.debug('Creating Cardano observation extractor...');
    const observationExtractor = new CardanoBlockFrostObservationExtractor(
      dataSource,
      tokenMap,
      configs.contracts.cardano.addresses.lock,
      CallbackLoggerFactory.getInstance().getLogger(
        'cardano-BlockFrost-observation-extractor',
      ),
    );

    logger.debug('Registering observation extractor with scanner...');
    await cardanoScanner.registerExtractor(observationExtractor);
    logger.info('Cardano observation extractor registered successfully');
  } catch (error) {
    logger.error(
      `Failed to create or register Cardano observation extractor: ${error instanceof Error ? error.message : error}`,
    );
    if (error instanceof Error && error.stack) {
      logger.debug(error.stack);
    }
  }

  logger.info('Cardano scanner initialization completed successfully');
  return cardanoScanner;
};

/**
 * Initializes and configures a Cardano Ogmios scanner instance.
 *
 * @param dataSource - TypeORM DataSource for DB connection
 * @returns Configured and ready-to-use CardanoOgmiosScanner instance
 * @throws Error if observation extractor creation or registration fails
 */
export const buildCardanoOgmiosScannerWithExtractors = async (
  dataSource: DataSource,
) => {
  logger.info('Starting Cardano scanner initialization...');

  // Create Cardano scanner with ogmios network settings
  const cardanoScanner = new CardanoOgmiosScanner(
    {
      dataSource: dataSource,
      nodeHostOrIp: configs.chains.cardano.ogmios.connection.address!,
      nodePort: configs.chains.cardano.ogmios.connection.port!,
      initialSlot: configs.chains.cardano.ogmios.connection.initialSlot!,
      initialHash: configs.chains.cardano.ogmios.connection.initialHash!,
    },
    CallbackLoggerFactory.getInstance().getLogger(
      'cardano-ogmios-scanner-logger',
    ),
  );

  try {
    const tokenMap = TokensConfig.getInstance().getTokenMap();

    logger.debug('Creating Cardano observation extractor...');
    const observationExtractor = new CardanoOgmiosObservationExtractor(
      dataSource,
      tokenMap,
      configs.contracts.cardano.addresses.lock,
      CallbackLoggerFactory.getInstance().getLogger(
        'cardano-ogmios-observation-extractor',
      ),
    );

    logger.debug('Registering observation extractor with scanner...');
    await cardanoScanner.registerExtractor(observationExtractor);
    logger.info('Cardano observation extractor registered successfully');
  } catch (error) {
    logger.error(
      `Failed to create or register Cardano observation extractor: ${error instanceof Error ? error.message : error}`,
    );
    if (error instanceof Error && error.stack) {
      logger.debug(error.stack);
    }
  }

  logger.info('Cardano scanner initialization completed successfully');
  return cardanoScanner;
};
