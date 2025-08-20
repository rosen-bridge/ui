import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import {
  CardanoKoiosObservationExtractor,
  CardanoBlockFrostObservationExtractor,
  CardanoOgmiosObservationExtractor,
} from '@rosen-bridge/observation-extractor';
import * as scanner from '@rosen-bridge/scanner';

import { configs } from '../configs';
import { TokensConfig } from '../utils';

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
  const cardanoScanner = new scanner.CardanoKoiosScanner({
    dataSource: dataSource,
    initialHeight: configs.chains.cardano.initialHeight,
    network: new scanner.KoiosNetwork(
      configs.chains.cardano.koios.url!,
      configs.chains.cardano.koios.timeout! * 1000,
      configs.chains.cardano.koios.authToken,
    ),
    blockRetrieveGap: configs.chains.cardano.blockRetrieveGap,
    suffix: configs.chains.cardano.koios.suffix,
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
  const cardanoScanner = new scanner.CardanoBlockFrostScanner({
    dataSource: dataSource,
    initialHeight: configs.chains.cardano.initialHeight,
    network: new scanner.BlockFrostNetwork(
      configs.chains.cardano.blockfrost.projectId!,
      configs.chains.cardano.blockfrost.url,
    ),
    blockRetrieveGap: configs.chains.cardano.blockRetrieveGap,
    suffix: configs.chains.cardano.blockfrost.suffix,
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
  const cardanoScanner = new scanner.CardanoOgmiosScanner(
    {
      dataSource: dataSource,
      nodeHostOrIp: configs.chains.cardano.ogmios.address!,
      nodePort: configs.chains.cardano.ogmios.port!,
      initialSlot: configs.chains.cardano.ogmios.initialSlot!,
      initialHash: configs.chains.cardano.ogmios.initialHash!,
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
  }

  logger.info('Cardano scanner initialization completed successfully');
  return cardanoScanner;
};
