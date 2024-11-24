import { CardanoKoiosObservationExtractor } from '@rosen-bridge/observation-extractor';
import { CardanoKoiosScanner } from '@rosen-bridge/scanner';
import WinstonLogger from '@rosen-bridge/winston-logger';

import config from '../../configs';
import dataSource from '../../data-source';
import AppError from '../../errors/AppError';
import { getRosenTokens } from '../../utils';

const logger = WinstonLogger.getInstance().getLogger(import.meta.url);

/**
 * register an observation extractor for the provided scanner
 * @param scanner
 */
export const registerCardanoExtractor = (scanner: CardanoKoiosScanner) => {
  try {
    const observationExtractor = new CardanoKoiosObservationExtractor(
      dataSource,
      getRosenTokens(),
      config.cardano.addresses.lock,
      logger,
    );

    scanner.registerExtractor(observationExtractor);

    logger.debug('cardano observation extractor registered', {
      scannerName: scanner.name(),
    });
  } catch (error) {
    throw new AppError(
      `cannot create or register cardano observation extractor due to error: ${error}`,
      false,
      'error',
      error instanceof Error ? error.stack : undefined,
      {
        scannerName: scanner.name(),
      },
    );
  }
};
