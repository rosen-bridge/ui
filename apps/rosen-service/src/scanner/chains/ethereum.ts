import { EvmRpcScanner } from '@rosen-bridge/evm-rpc-scanner';
import WinstonLogger from '@rosen-bridge/winston-logger';

import dataSource from '../../data-source';

import { startScanner } from '../scanner-utils';

import observationService from '../../observation/observation-service';

import config from '../../configs';

import {
  ETHEREUM_SCANNER_INTERVAL,
  ETHEREUM_SCANNER_LOGGER_NAME,
  SCANNER_API_TIMEOUT,
} from '../../constants';

import AppError from '../../errors/AppError';

const logger = WinstonLogger.getInstance().getLogger(import.meta.url);
const scannerLogger = WinstonLogger.getInstance().getLogger(
  ETHEREUM_SCANNER_LOGGER_NAME
);

/**
 * create a ethereum scanner, initializing it and calling its update method
 * periodically
 */
export const startEthereumScanner = async () => {
  try {
    const scanner = new EvmRpcScanner(
      'ethereum',
      {
        RpcUrl: config.ethereum.rpcUrl,
        dataSource,
        initialHeight: config.ethereum.initialHeight,
        timeout: SCANNER_API_TIMEOUT,
      },
      scannerLogger,
      config.ethereum.rpcAuthToken
    );

    observationService.registerEthereumExtractor(scanner);

    await startScanner(scanner, import.meta.url, ETHEREUM_SCANNER_INTERVAL);

    logger.debug('ethereum scanner started');

    return scanner;
  } catch (error) {
    throw new AppError(
      `cannot create or start ethereum scanner due to error: ${error}`,
      false,
      'error',
      error instanceof Error ? error.stack : undefined
    );
  }
};