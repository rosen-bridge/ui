import { DogeRpcScanner } from '@rosen-bridge/bitcoin-rpc-scanner';
import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';

import config from '../../configs';
import {
  DOGE_SCANNER_INTERVAL,
  DOGE_SCANNER_LOGGER_NAME,
  SCANNER_API_TIMEOUT,
} from '../../constants';
import dataSource from '../../data-source';
import AppError from '../../errors/AppError';
import observationService from '../../observation/observation-service';
import { startScanner } from '../scanner-utils';

const logger = CallbackLoggerFactory.getInstance().getLogger(import.meta.url);
const scannerLogger = CallbackLoggerFactory.getInstance().getLogger(
  DOGE_SCANNER_LOGGER_NAME,
);

/**
 * create a dogecoin scanner, initializing it and calling its update method
 * periodically
 */
export const startDogeScanner = async () => {
  try {
    const scanner = new DogeRpcScanner(
      {
        rpcUrl: config.doge.rpcUrl,
        username: config.doge.rpcUsername,
        password: config.doge.rpcPassword,
        dataSource,
        initialHeight: config.doge.initialHeight,
        timeout: SCANNER_API_TIMEOUT,
      },
      scannerLogger,
    );

    observationService.registerDogeExtractor(scanner);

    await startScanner(scanner, import.meta.url, DOGE_SCANNER_INTERVAL);

    logger.debug('doge scanner started');

    return scanner;
  } catch (error) {
    throw new AppError(
      `cannot create or start doge scanner due to error: ${error}`,
      false,
      'error',
      error instanceof Error ? error.stack : undefined,
    );
  }
};
