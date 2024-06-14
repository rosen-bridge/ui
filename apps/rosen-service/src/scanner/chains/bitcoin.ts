import { BitcoinEsploraScanner } from '@rosen-bridge/bitcoin-esplora-scanner';
import WinstonLogger from '@rosen-bridge/winston-logger';

import dataSource from '../../data-source';

import { startScanner } from '../scanner-utils';

import observationService from '../../observation/observation-service';

import config from '../../configs';

import {
  BITCOIN_SCANNER_INTERVAL,
  BITCOIN_SCANNER_LOGGER_NAME,
  SCANNER_API_TIMEOUT,
} from '../../constants';

import AppError from '../../errors/AppError';

const logger = WinstonLogger.getInstance().getLogger(import.meta.url);
const scannerLogger = WinstonLogger.getInstance().getLogger(
  BITCOIN_SCANNER_LOGGER_NAME
);

/**
 * create a bitcoin scanner, initializing it and calling its update method
 * periodically
 */
export const startBitcoinScanner = async () => {
  try {
    const scanner = new BitcoinEsploraScanner(
      {
        esploraUrl: config.bitcoin.esploraUrl,
        dataSource,
        initialHeight: config.bitcoin.initialHeight,
        timeout: SCANNER_API_TIMEOUT,
      },
      scannerLogger
    );

    observationService.registerBitcoinExtractor(scanner);

    await startScanner(scanner, import.meta.url, BITCOIN_SCANNER_INTERVAL);

    logger.debug('bitcoin scanner started');

    return scanner;
  } catch (error) {
    throw new AppError(
      `cannot create or start bitcoin scanner due to error: ${error}`,
      false,
      'error',
      error instanceof Error ? error.stack : undefined
    );
  }
};
