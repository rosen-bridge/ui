import { ErgoNetworkType, ErgoScanner } from '@rosen-bridge/scanner';
import WinstonLogger from '@rosen-bridge/winston-logger';

import dataSource from '../../data-source';

import { startScanner } from '../../scanner/scanner-utils';

import eventTriggerService from '../../event-trigger/event-trigger-service';
import observationService from '../../observation/observation-service';

import config from '../../configs';

import {
  ERGO_EXPLORER_URL,
  ERGO_SCANNER_INTERVAL,
  ERGO_SCANNER_LOGGER_NAME,
  SCANNER_API_TIMEOUT,
} from '../../constants';

import AppError from '../../errors/AppError';

const logger = WinstonLogger.getInstance().getLogger(import.meta.url);
const scannerLogger = WinstonLogger.getInstance().getLogger(
  ERGO_SCANNER_LOGGER_NAME
);

/**
 * create an ergo scanner, initializing it and calling its update method
 * periodically
 */
export const startErgoScanner = async () => {
  try {
    const scanner = new ErgoScanner(
      {
        type: ErgoNetworkType.Explorer,
        url: ERGO_EXPLORER_URL,
        dataSource,
        initialHeight: config.ergo.initialHeight,
        timeout: SCANNER_API_TIMEOUT,
      },
      scannerLogger
    );

    observationService.registerErgoExtractor(scanner);
    eventTriggerService.registerExtractors(scanner);

    await startScanner(scanner, import.meta.url, ERGO_SCANNER_INTERVAL);

    logger.debug('ergo scanner started');

    return scanner;
  } catch (error) {
    throw new AppError(
      `cannot create or start ergo scanner due to error: ${error}`,
      false,
      'error',
      error instanceof Error ? error.stack : undefined
    );
  }
};
