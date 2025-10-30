import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';
import { HandshakeRpcObservationExtractor } from '@rosen-bridge/handshake-rpc-observation-extractor';
import { HandshakeRpcScanner } from '@rosen-bridge/handshake-rpc-scanner';

import config from '../../configs';
import dataSource from '../../data-source';
import AppError from '../../errors/AppError';
import { getTokenMap } from '../../utils';

const logger = CallbackLoggerFactory.getInstance().getLogger(import.meta.url);

/**
 * register an observation extractor for the provided scanner
 * @param scanner
 */
export const registerHandshakeExtractor = async (
  scanner: HandshakeRpcScanner,
) => {
  try {
    const observationExtractor = new HandshakeRpcObservationExtractor(
      config.handshake.addresses.lock,
      dataSource,
      await getTokenMap(),
      logger,
    );

    await scanner.registerExtractor(observationExtractor);

    logger.debug('handshake observation extractor registered', {
      scannerName: scanner.name(),
    });
  } catch (error) {
    throw new AppError(
      `cannot create or register handshake observation extractor due to error: ${error}`,
      false,
      'error',
      error instanceof Error ? error.stack : undefined,
      {
        scannerName: scanner.name(),
      },
    );
  }
};
