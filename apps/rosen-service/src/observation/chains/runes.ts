import { BitcoinRpcScanner } from '@rosen-bridge/bitcoin-rpc-scanner';
import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';
import { RunesRpcObservationExtractor } from '@rosen-bridge/runes-observation-extractor';

import config from '../../configs';
import dataSource from '../../data-source';
import AppError from '../../errors/AppError';
import { getTokenMap } from '../../utils';

const logger = CallbackLoggerFactory.getInstance().getLogger(import.meta.url);

/**
 * register an observation extractor for the provided scanner
 * @param scanner
 */
export const registerRunesExtractor = async (scanner: BitcoinRpcScanner) => {
  try {
    const observationExtractor = new RunesRpcObservationExtractor(
      config.runes.addresses.lock,
      config.runes.ordiscanUrl,
      config.runes.ordiscanApiKey,
      dataSource,
      await getTokenMap(),
      logger,
    );

    await scanner.registerExtractor(observationExtractor);

    logger.debug('runes observation extractor registered', {
      scannerName: scanner.name(),
    });
  } catch (error) {
    throw new AppError(
      `cannot create or register runes observation extractor due to error: ${error}`,
      false,
      'error',
      error instanceof Error ? error.stack : undefined,
      {
        scannerName: scanner.name(),
      },
    );
  }
};
