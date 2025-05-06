import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';
import { ErgoScanner } from '@rosen-bridge/scanner';
import { ErgoNetworkType } from '@rosen-bridge/scanner-interfaces';

import config from '../../configs';
import {
  ERGO_SCANNER_INTERVAL,
  ERGO_SCANNER_LOGGER_NAME,
  SCANNER_API_TIMEOUT,
} from '../../constants';
import dataSource from '../../data-source';
import AppError from '../../errors/AppError';
import eventTriggerService from '../../event-trigger/event-trigger-service';
import observationService from '../../observation/observation-service';
import { startScanner } from '../../scanner/scanner-utils';

const logger = CallbackLoggerFactory.getInstance().getLogger(import.meta.url);
const scannerLogger = CallbackLoggerFactory.getInstance().getLogger(
  ERGO_SCANNER_LOGGER_NAME,
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
        url: config.ergo.explorerUrl,
        dataSource,
        initialHeight: config.ergo.initialHeight,
        timeout: SCANNER_API_TIMEOUT,
      },
      scannerLogger,
    );

    await observationService.registerErgoExtractor(scanner);
    await eventTriggerService.registerExtractors(scanner);

    await startScanner(scanner, import.meta.url, ERGO_SCANNER_INTERVAL);

    logger.debug('ergo scanner started');

    return scanner;
  } catch (error) {
    throw new AppError(
      `cannot create or start ergo scanner due to error: ${error}`,
      false,
      'error',
      error instanceof Error ? error.stack : undefined,
    );
  }
};
