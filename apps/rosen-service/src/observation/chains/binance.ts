import { DefaultLogger } from '@rosen-bridge/abstract-logger';
import { BinanceRpcObservationExtractor } from '@rosen-bridge/evm-observation-extractor';
import type { EvmRpcScanner } from '@rosen-bridge/evm-scanner';

import config from '../../configs';
import dataSource from '../../data-source';
import AppError from '../../errors/AppError';
import { getTokenMap } from '../../utils';

const logger = DefaultLogger.getInstance().child(import.meta.url);

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
      logger.child('binanceObservationExtractor'),
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
