import { BitcoinRunesRpcObservationExtractor } from '@rosen-bridge/bitcoin-runes-observation-extractor';
import { UnisatRunesProtocolNetwork } from '@rosen-bridge/bitcoin-runes-observation-extractor';
import { BitcoinRpcScanner } from '@rosen-bridge/bitcoin-scanner';
import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';
import { RateLimitedAxiosConfig } from '@rosen-clients/rate-limited-axios';

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
    // TODO: Ordiscan should also be added as an observation network in rosen-service2
    const observationNetwork = new UnisatRunesProtocolNetwork(
      config.bitcoinRunes.unisatUrl,
      config.bitcoinRunes.unisatApiKey,
      CallbackLoggerFactory.getInstance().getLogger(
        'UnisatRunesProtocolNetwork',
      ),
    );
    RateLimitedAxiosConfig.addRule(
      config.bitcoinRunes.unisatUrl,
      5, // 5 calls/second
      1,
      8000, // timeout
    );
    // TODO: add 2000 calls/second rule when multiple rules are supported

    const observationExtractor = new BitcoinRunesRpcObservationExtractor(
      config.bitcoinRunes.addresses.lock,
      observationNetwork,
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
