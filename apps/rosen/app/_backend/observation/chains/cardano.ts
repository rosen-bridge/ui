import { CardanoKoiosObservationExtractor } from '@rosen-bridge/observation-extractor';
import { CardanoKoiosScanner } from '@rosen-bridge/scanner';
import WinstonLogger from '@rosen-bridge/winston-logger';

import { getRosenTokens } from '@/_utils';

import dataSource from '@/_backend/dataSource';

const logger = WinstonLogger.getInstance().getLogger(import.meta.url);

/**
 * register an observation extractor for the provided scanner
 * @param scanner
 */
export const registerCardanoExtractor = (scanner: CardanoKoiosScanner) => {
  if (!process.env.NEXT_PUBLIC_CARDANO_LOCK_ADDRESS) {
    throw new Error(
      'Cardano lock address config is not set. Cannot register a Cardano observation extractor.',
    );
  }

  const observationExtractor = new CardanoKoiosObservationExtractor(
    dataSource,
    getRosenTokens(),
    process.env.NEXT_PUBLIC_CARDANO_LOCK_ADDRESS,
    logger,
  );

  scanner.registerExtractor(observationExtractor);
};
