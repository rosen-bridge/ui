import { DefaultLogger } from '@rosen-bridge/abstract-logger';
import {
  FailoverStrategy,
  NetworkConnectorManager,
} from '@rosen-bridge/abstract-scanner';
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
import { TokenMap } from '@rosen-bridge/extended-tokens';
import { DataSource } from '@rosen-bridge/extended-typeorm';

import { configs } from '../configs';
import {
  CARDANO_METHOD_BLOCKFROST,
  CARDANO_METHOD_KOIOS,
  CARDANO_METHOD_OGMIOS,
} from '../constants';

const logger = DefaultLogger.getInstance().child(import.meta.url);

/**
 * Initializes and configures a Cardano Koios scanner instance.
 *
 * @param dataSource - TypeORM DataSource for DB connection
 * @param tokenMap
 * @returns Configured and ready-to-use CardanoKoiosScanner instance
 * @throws Error if observation extractor creation or registration fails
 */
const buildCardanoKoiosScannerWithExtractors = async (
  dataSource: DataSource,
  tokenMap: TokenMap,
) => {
  logger.info('Starting Cardano scanner initialization...');

  // Create Cardano scanner with Koios network settings
  const networkConnectorManager = new NetworkConnectorManager<KoiosTransaction>(
    new FailoverStrategy(),
    logger.child('cardanoKoiosScannerLogger'),
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
    logger: logger.child('cardanoKoiosScannerLogger'),
  });

  try {
    logger.debug('Creating Cardano observation extractor...');
    const observationExtractor = new CardanoKoiosObservationExtractor(
      configs.contracts.cardano.addresses.lock,
      dataSource,
      tokenMap,
      logger.child('cardanoKoiosObservationExtractor'),
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
 * @param tokenMap
 * @returns Configured and ready-to-use CardanoBlockFrostScanner instance
 * @throws Error if observation extractor creation or registration fails
 */
const buildCardanoBlockFrostScannerWithExtractors = async (
  dataSource: DataSource,
  tokenMap: TokenMap,
) => {
  logger.info('Starting Cardano scanner initialization...');

  // Create Cardano scanner with BlockFrost network settings
  const networkConnectorManager =
    new NetworkConnectorManager<BlockFrostTransaction>(
      new FailoverStrategy(),
      logger.child('cardanoBlockFrostScannerLogger'),
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
    logger: logger.child('cardanoBlockFrostScannerLogger'),
  });

  try {
    logger.debug('Creating Cardano observation extractor...');
    const observationExtractor = new CardanoBlockFrostObservationExtractor(
      configs.contracts.cardano.addresses.lock,

      dataSource,
      tokenMap,
      logger.child('cardanoBlockFrostObservationExtractor'),
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
 * @param tokenMap
 * @returns Configured and ready-to-use CardanoOgmiosScanner instance
 * @throws Error if observation extractor creation or registration fails
 */
const buildCardanoOgmiosScannerWithExtractors = async (
  dataSource: DataSource,
  tokenMap: TokenMap,
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
    logger.child('cardanoOgmiosScannerLogger'),
  );

  try {
    logger.debug('Creating Cardano observation extractor...');
    const observationExtractor = new CardanoOgmiosObservationExtractor(
      configs.contracts.cardano.addresses.lock,

      dataSource,
      tokenMap,
      logger.child('cardanoOgmiosObservationExtractor'),
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
 * create a cardano scanner.
 *
 * @param dataSource - TypeORM DataSource for database connection
 * @param tokenMap
 * @returns { CardanoKoiosScanner | CardanoBlockFrostScanner | CardanoOgmiosScanner}
 * @throws Error if observation extractor creation or registration fails
 */
export const getCardanoScanner = async (
  dataSource: DataSource,
  tokenMap: TokenMap,
): Promise<
  CardanoKoiosScanner | CardanoBlockFrostScanner | CardanoOgmiosScanner
> => {
  switch (configs.chains.cardano.method) {
    case CARDANO_METHOD_BLOCKFROST:
      return await buildCardanoBlockFrostScannerWithExtractors(
        dataSource,
        tokenMap,
      );
    case CARDANO_METHOD_OGMIOS:
      return await buildCardanoOgmiosScannerWithExtractors(
        dataSource,
        tokenMap,
      );
    case CARDANO_METHOD_KOIOS:
      return await buildCardanoKoiosScannerWithExtractors(dataSource, tokenMap);
    default:
      throw new Error(`Unsupported or missing Doge scanner method.`);
  }
};
