import { ErgoNetworkType, ErgoScanner } from '@rosen-bridge/scanner';
import WinstonLogger from '@rosen-bridge/winston-logger';

import dataSource from '@/_backend/dataSource';

import { startScanner } from '@/_backend/scanner/scanner-utils';

import {
  ERGO_EXPLORER_URL,
  ERGO_SCANNER_INTERVAL,
  ERGO_SCANNER_LOGGER_NAME,
  SCANNER_API_TIMEOUT,
} from '@/_backend/constants';

const scannerLogger = WinstonLogger.getInstance().getLogger(
  ERGO_SCANNER_LOGGER_NAME,
);

/**
 * create an ergo scanner, initializing it and calling its update method
 * periodically
 */
export const startErgoScanner = async () => {
  const scanner = new ErgoScanner(
    {
      type: ErgoNetworkType.Explorer,
      url: ERGO_EXPLORER_URL,
      dataSource,
      initialHeight: Number(process.env.ERGO_INITIAL_HEIGHT) || 0,
      timeout: SCANNER_API_TIMEOUT,
    },
    scannerLogger,
  );

  startScanner(scanner, import.meta.url, ERGO_SCANNER_INTERVAL);

  return scanner;
};
