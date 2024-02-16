import { ErgoObservationExtractor } from '@rosen-bridge/observation-extractor';
import { ErgoScanner } from '@rosen-bridge/scanner';
import WinstonLogger from '@rosen-bridge/winston-logger';

import { getRosenTokens } from '../../utils';

import config from '../../configs';

import dataSource from '../../data-source';

import AppError from '../../errors/AppError';

const logger = WinstonLogger.getInstance().getLogger(import.meta.url);

/**
 * register an observation extractor for the provided scanner
 * @param scanner
 */
export const registerErgoExtractor = (scanner: ErgoScanner) => {
  try {
    const observationExtractor = new ErgoObservationExtractor(
      dataSource,
      getRosenTokens(),
      config.ergo.addresses.lock,
      logger
    );

    scanner.registerExtractor(observationExtractor);

    logger.debug('ergo observation extractor registered', {
      scannerName: scanner.name(),
    });
  } catch (error) {
    throw new AppError(
      `cannot create or register ergo observation extractor due to error: ${error}`,
      false,
      'error',
      error instanceof Error ? error.stack : undefined,
      {
        scannerName: scanner.name(),
      }
    );
  }
};
