import { ErgoObservationExtractor } from '@rosen-bridge/observation-extractor';
import { ErgoScanner } from '@rosen-bridge/scanner';
import WinstonLogger from '@rosen-bridge/winston-logger/dist/WinstonLogger';

import { getRosenTokens } from '@/_backend/utils';

import dataSource from '@/_backend/dataSource';

const logger = WinstonLogger.getInstance().getLogger(import.meta.url);

/**
 * register an observation extractor for the provided scanner
 * @param scanner
 */
export const registerErgoExtractor = (scanner: ErgoScanner) => {
  if (!process.env.NEXT_PUBLIC_ERGO_LOCK_ADDRESS) {
    throw new Error(
      'Cardano lock address config is not set. Cannot register a Cardano observation extractor.',
    );
  }

  const observationExtractor = new ErgoObservationExtractor(
    dataSource,
    getRosenTokens(),
    process.env.NEXT_PUBLIC_ERGO_LOCK_ADDRESS,
    logger,
  );

  scanner.registerExtractor(observationExtractor);
};
