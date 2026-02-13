import { DefaultLogger } from '@rosen-bridge/abstract-logger';
import { BitcoinRpcObservationExtractor } from '@rosen-bridge/bitcoin-observation-extractor';
import { BitcoinRpcScanner } from '@rosen-bridge/bitcoin-scanner';

import config from '../../configs';
import dataSource from '../../data-source';
import AppError from '../../errors/AppError';
import { getTokenMap } from '../../utils';

const logger = DefaultLogger.getInstance().child(import.meta.url);

/**
 * register an observation extractor for the provided scanner
 * @param scanner
 */
export const registerBitcoinExtractor = async (scanner: BitcoinRpcScanner) => {
  try {
    const observationExtractor = new BitcoinRpcObservationExtractor(
      config.bitcoin.addresses.lock,
      dataSource,
      await getTokenMap(),
      logger.child('bitcoinRpcObservationExtractor'),
    );

    await scanner.registerExtractor(observationExtractor);

    logger.debug('bitcoin observation extractor registered', {
      scannerName: scanner.name(),
    });
  } catch (error) {
    throw new AppError(
      `cannot create or register bitcoin observation extractor due to error: ${error}`,
      false,
      'error',
      error instanceof Error ? error.stack : undefined,
      {
        scannerName: scanner.name(),
      },
    );
  }
};
