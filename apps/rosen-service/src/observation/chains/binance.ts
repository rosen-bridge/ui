import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';
import { BinanceRpcObservationExtractor } from '@rosen-bridge/evm-observation-extractor';
import { EvmRpcScanner } from '@rosen-bridge/evm-rpc-scanner';

import config from '../../configs';
import dataSource from '../../data-source';
import AppError from '../../errors/AppError';
import { getTokenMap } from '../../utils';

const logger = CallbackLoggerFactory.getInstance().getLogger(import.meta.url);

/**
 * register an observation extractor for the provided scanner
 * @param scanner
 */
export const registerBinanceExtractor = async (scanner: EvmRpcScanner) => {
  try {
    const observationExtractor = new BinanceRpcObservationExtractor(
      config.binance.addresses.lock,
      dataSource,
      await getTokenMap(),
      logger,
    );

    await scanner.registerExtractor(observationExtractor);

    logger.debug('binance observation extractor registered', {
      scannerName: scanner.name(),
    });
  } catch (error) {
    throw new AppError(
      `cannot create or register binance observation extractor due to error: ${error}`,
      false,
      'error',
      error instanceof Error ? error.stack : undefined,
      {
        scannerName: scanner.name(),
      },
    );
  }
};
