import { BitcoinRpcScanner } from '@rosen-bridge/bitcoin-rpc-scanner';
import { BitcoinRunesRpcObservationExtractor } from '@rosen-bridge/bitcoin-runes-observation-extractor';
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
export const registerBitcoinRunesExtractor = async (
  scanner: BitcoinRpcScanner,
) => {
  try {
    const observationExtractor = new BitcoinRunesRpcObservationExtractor(
      config.bitcoinRunes.addresses.lock,
      config.bitcoinRunes.unisatUrl,
      config.bitcoinRunes.unisatApiKey,
      dataSource,
      await getTokenMap(),
      logger,
    );

    await scanner.registerExtractor(observationExtractor);

    logger.debug('bitcoin-runes observation extractor registered', {
      scannerName: scanner.name(),
    });
  } catch (error) {
    throw new AppError(
      `cannot create or register bitcoin-runes observation extractor due to error: ${error}`,
      false,
      'error',
      error instanceof Error ? error.stack : undefined,
      {
        scannerName: scanner.name(),
      },
    );
  }
};
