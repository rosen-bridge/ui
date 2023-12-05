import { ErgoObservationExtractor } from '@rosen-bridge/observation-extractor';
import { ErgoScanner } from '@rosen-bridge/scanner';
import WinstonLogger from '@rosen-bridge/winston-logger';

import { getRosenTokens } from '../../utils';

import config from '../../configs';

import dataSource from '../../data-source';

const logger = WinstonLogger.getInstance().getLogger(import.meta.url);

/**
 * register an observation extractor for the provided scanner
 * @param scanner
 */
export const registerErgoExtractor = (scanner: ErgoScanner) => {
  if (!config.ergo.addresses.lock) {
    throw new Error(
      'Cardano lock address config is not set. Cannot register a Cardano observation extractor.'
    );
  }

  const observationExtractor = new ErgoObservationExtractor(
    dataSource,
    getRosenTokens(),
    config.ergo.addresses.lock,
    logger
  );

  scanner.registerExtractor(observationExtractor);
};
