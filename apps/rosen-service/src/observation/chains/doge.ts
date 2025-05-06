import { DogeRpcObservationExtractor } from '@rosen-bridge/bitcoin-observation-extractor';
import { DogeRpcScanner } from '@rosen-bridge/bitcoin-rpc-scanner';
import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';

import config from '../../configs';
import dataSource from '../../data-source';
import AppError from '../../errors/AppError';
import { getTokenMap } from '../../utils';

const logger = CallbackLoggerFactory.getInstance().getLogger(import.meta.url);

/**
 * register an observation extractor for the provided scanner
 * @param scanner
 */
export const registerDogeExtractor = async (scanner: DogeRpcScanner) => {
  try {
    const observationExtractor = new DogeRpcObservationExtractor(
      config.doge.addresses.lock,
      dataSource,
      await getTokenMap(),
      logger,
    );

    await scanner.registerExtractor(observationExtractor);

    logger.debug('doge observation extractor registered', {
      scannerName: scanner.name(),
    });
  } catch (error) {
    throw new AppError(
      `cannot create or register doge observation extractor due to error: ${error}`,
      false,
      'error',
      error instanceof Error ? error.stack : undefined,
      {
        scannerName: scanner.name(),
      },
    );
  }
};
