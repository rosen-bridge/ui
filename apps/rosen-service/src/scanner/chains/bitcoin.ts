import { BitcoinRpcScanner } from '@rosen-bridge/bitcoin-rpc-scanner';
import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';

import config from '../../configs';
import {
  BITCOIN_SCANNER_INTERVAL,
  BITCOIN_SCANNER_LOGGER_NAME,
  SCANNER_API_TIMEOUT,
} from '../../constants';
import dataSource from '../../data-source';
import AppError from '../../errors/AppError';
import observationService from '../../observation/observation-service';
import { startScanner } from '../scanner-utils';

const logger = CallbackLoggerFactory.getInstance().getLogger(import.meta.url);
const scannerLogger = CallbackLoggerFactory.getInstance().getLogger(
  BITCOIN_SCANNER_LOGGER_NAME,
);

/**
 * create a bitcoin scanner, initializing it and calling its update method
 * periodically
 */
export const startBitcoinScanner = async () => {
  try {
    const scanner = new BitcoinRpcScanner(
      {
        rpcUrl: config.bitcoin.rpcUrl,
        dataSource,
        initialHeight: config.bitcoin.initialHeight,
        timeout: SCANNER_API_TIMEOUT,
        username: config.bitcoin.rpcUsername,
        password: config.bitcoin.rpcPassword,
      },
      scannerLogger,
    );

    await observationService.registerBitcoinExtractor(scanner);

    await startScanner(scanner, import.meta.url, BITCOIN_SCANNER_INTERVAL);

    logger.debug('bitcoin scanner started');

    return scanner;
  } catch (error) {
    throw new AppError(
      `cannot create or start bitcoin scanner due to error: ${error}`,
      false,
      'error',
      error instanceof Error ? error.stack : undefined,
    );
  }
};
