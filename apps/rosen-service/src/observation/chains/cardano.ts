import { CardanoKoiosObservationExtractor } from '@rosen-bridge/observation-extractor';
import { CardanoKoiosScanner } from '@rosen-bridge/scanner';
import WinstonLogger from '@rosen-bridge/winston-logger';

import { getRosenTokens } from '../../utils';

import config from '../../configs';

import dataSource from '../../data-source';

const logger = WinstonLogger.getInstance().getLogger(import.meta.url);

/**
 * register an observation extractor for the provided scanner
 * @param scanner
 */
export const registerCardanoExtractor = (scanner: CardanoKoiosScanner) => {
  if (!config.cardano.addresses.lock) {
    throw new Error(
      'Cardano lock address config is not set. Cannot register a Cardano observation extractor.'
    );
  }

  const observationExtractor = new CardanoKoiosObservationExtractor(
    dataSource,
    getRosenTokens(),
    config.cardano.addresses.lock,
    logger
  );

  scanner.registerExtractor(observationExtractor);
};
