import { DefaultLogger } from '@rosen-bridge/abstract-logger';
import { HandshakeRpcObservationExtractor } from '@rosen-bridge/handshake-observation-extractor';
import { HandshakeRpcScanner } from '@rosen-bridge/handshake-scanner';

import config from '../../configs';
import dataSource from '../../data-source';
import AppError from '../../errors/AppError';
import { getTokenMap } from '../../utils';

const logger = DefaultLogger.getInstance().child(import.meta.url);

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
      logger.child('handshakeRpcObservationExtractor'),
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
