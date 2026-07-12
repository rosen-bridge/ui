import { DefaultLogger } from '@rosen-bridge/abstract-logger';
import { DogeRpcObservationExtractor } from '@rosen-bridge/bitcoin-observation-extractor';
import type { DogeRpcScanner } from '@rosen-bridge/bitcoin-scanner';

import config from '../../configs';
import dataSource from '../../data-source';
import AppError from '../../errors/AppError';
import { getTokenMap } from '../../utils';

const logger = DefaultLogger.getInstance().child(import.meta.url);

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
      logger.child('dogeRpcObservationExtractor'),
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
