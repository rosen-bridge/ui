import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';
import { CardanoKoiosScanner } from '@rosen-bridge/scanner';

import config from '../../configs';
import {
  CARDANO_SCANNER_INTERVAL,
  CARDANO_SCANNER_LOGGER_NAME,
  SCANNER_API_TIMEOUT,
} from '../../constants';
import dataSource from '../../data-source';
import AppError from '../../errors/AppError';
import observationService from '../../observation/observation-service';
import { startScanner } from '../scanner-utils';

const logger = CallbackLoggerFactory.getInstance().getLogger(import.meta.url);
const scannerLogger = CallbackLoggerFactory.getInstance().getLogger(
  CARDANO_SCANNER_LOGGER_NAME,
);

/**
 * create a cardano scanner, initializing it and calling its update method
 * periodically
 */
export const startCardanoScanner = async () => {
  try {
    const scanner = new CardanoKoiosScanner(
      {
        dataSource,
        initialHeight: config.cardano.initialHeight,
        koiosUrl: config.cardano.koiosUrl,
        timeout: SCANNER_API_TIMEOUT,
      },
      scannerLogger,
      config.cardano.koiosAuthToken,
    );

    await observationService.registerCardanoExtractor(scanner);

    await startScanner(scanner, import.meta.url, CARDANO_SCANNER_INTERVAL);

    logger.debug('cardano scanner started');

    return scanner;
  } catch (error) {
    throw new AppError(
      `cannot create or start cardano scanner due to error: ${error}`,
      false,
      'error',
      error instanceof Error ? error.stack : undefined,
    );
  }
};
