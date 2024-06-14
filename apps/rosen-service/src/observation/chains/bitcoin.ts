import { BitcoinEsploraObservationExtractor } from '@rosen-bridge/bitcoin-observation-extractor';
import WinstonLogger from '@rosen-bridge/winston-logger';

import { getRosenTokens } from '../../utils';

import config from '../../configs';

import dataSource from '../../data-source';

import AppError from '../../errors/AppError';
import { BitcoinEsploraScanner } from '@rosen-bridge/bitcoin-esplora-scanner';

const logger = WinstonLogger.getInstance().getLogger(import.meta.url);

/**
 * register an observation extractor for the provided scanner
 * @param scanner
 */
export const registerBitcoinExtractor = (scanner: BitcoinEsploraScanner) => {
  try {
    const observationExtractor = new BitcoinEsploraObservationExtractor(
      config.bitcoin.addresses.lock,
      dataSource,
      getRosenTokens(),
      logger
    );

    scanner.registerExtractor(observationExtractor);

    logger.debug('bitcoin observation extractor registered', {
      scannerName: scanner.name(),
    });
  } catch (error) {
    throw new AppError(
      `cannot create or register bitcoin observation extractor due to error: ${error}`,
      false,
      'error',
      error instanceof Error ? error.stack : undefined,
      {
        scannerName: scanner.name(),
      }
    );
  }
};
