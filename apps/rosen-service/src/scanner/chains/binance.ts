import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';
import { EvmRpcScanner } from '@rosen-bridge/evm-rpc-scanner';

import config from '../../configs';
import {
  BINANCE_SCANNER_INTERVAL,
  BINANCE_SCANNER_LOGGER_NAME,
  SCANNER_API_TIMEOUT,
} from '../../constants';
import dataSource from '../../data-source';
import AppError from '../../errors/AppError';
import observationService from '../../observation/observation-service';
import { startScanner } from '../scanner-utils';

const logger = CallbackLoggerFactory.getInstance().getLogger(import.meta.url);
const scannerLogger = CallbackLoggerFactory.getInstance().getLogger(
  BINANCE_SCANNER_LOGGER_NAME,
);

/**
 * create a binance scanner, initializing it and calling its update method
 * periodically
 */
export const startBinanceScanner = async () => {
  try {
    const scanner = new EvmRpcScanner(
      'binance',
      {
        RpcUrl: config.binance.rpcUrl,
        dataSource,
        initialHeight: config.binance.initialHeight,
        timeout: SCANNER_API_TIMEOUT,
      },
      scannerLogger,
      config.binance.rpcAuthToken,
    );

    await observationService.registerBinanceExtractor(scanner);

    await startScanner(scanner, import.meta.url, BINANCE_SCANNER_INTERVAL);

    logger.debug('binance scanner started');

    return scanner;
  } catch (error) {
    throw new AppError(
      `cannot create or start binance scanner due to error: ${error}`,
      false,
      'error',
      error instanceof Error ? error.stack : undefined,
    );
  }
};
