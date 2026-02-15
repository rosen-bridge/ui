import { DefaultLogger } from '@rosen-bridge/abstract-logger';
import { CardanoKoiosObservationExtractor } from '@rosen-bridge/cardano-observation-extractor';
import { CardanoKoiosScanner } from '@rosen-bridge/cardano-scanner';

import config from '../../configs';
import dataSource from '../../data-source';
import AppError from '../../errors/AppError';
import { getTokenMap } from '../../utils';

const logger = DefaultLogger.getInstance().child(import.meta.url);

/**
 * register an observation extractor for the provided scanner
 * @param scanner
 */
export const registerCardanoExtractor = async (
  scanner: CardanoKoiosScanner,
) => {
  try {
    const observationExtractor = new CardanoKoiosObservationExtractor(
      config.cardano.addresses.lock,
      dataSource,
      await getTokenMap(),
      logger.child('cardanoKoiosObservationExtractor'),
    );

    await scanner.registerExtractor(observationExtractor);

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
