import { ErgoNetworkType, ErgoScanner } from '@rosen-bridge/scanner';
import WinstonLogger from '@rosen-bridge/winston-logger';

import dataSource from '../../data-source';

import { startScanner } from '../../scanner/scanner-utils';

import config from '../../configs';

import {
  ERGO_EXPLORER_URL,
  ERGO_SCANNER_INTERVAL,
  ERGO_SCANNER_LOGGER_NAME,
  SCANNER_API_TIMEOUT,
} from '../../constants';

const scannerLogger = WinstonLogger.getInstance().getLogger(
  ERGO_SCANNER_LOGGER_NAME
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
      initialHeight: config.ergo.initialHeight,
      timeout: SCANNER_API_TIMEOUT,
    },
    scannerLogger
  );

  startScanner(scanner, import.meta.url, ERGO_SCANNER_INTERVAL);

  return scanner;
};
