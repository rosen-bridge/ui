import { DefaultLogger } from '@rosen-bridge/abstract-logger';
import { FiroObservationExtractor } from '@rosen-bridge/firo-observation-extractor';
import { FiroElectrumXScanner } from '@rosen-bridge/firo-scanner';

import config from '../../configs';
import dataSource from '../../data-source';
import AppError from '../../errors/AppError';
import { getTokenMap } from '../../utils';

const logger = DefaultLogger.getInstance().child(import.meta.url);

/**
 * register an observation extractor for the provided scanner
 * @param scanner
 */
export const registerFiroExtractor = async (scanner: FiroElectrumXScanner) => {
  try {
    const observationExtractor = new FiroObservationExtractor(
      config.firo.addresses.lock,
      dataSource,
      await getTokenMap(),
      logger.child('firoObservationExtractor'),
    );

    await scanner.registerExtractor(observationExtractor);

    logger.debug('firo observation extractor registered', {
      scannerName: scanner.name(),
    });
  } catch (error) {
    throw new AppError(
      `cannot create or register firo observation extractor due to error: ${error}`,
      false,
      'error',
      error instanceof Error ? error.stack : undefined,
      {
        scannerName: scanner.name(),
      },
    );
  }
};
