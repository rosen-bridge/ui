import { ErgoScanner } from '@rosen-bridge/scanner';
import { EventTriggerExtractor } from '@rosen-bridge/watcher-data-extractor';
import WinstonLogger from '@rosen-bridge/winston-logger';

import configs from '../configs';

import dataSource from '../data-source';

import AppError from '../errors/AppError';

const logger = WinstonLogger.getInstance().getLogger(import.meta.url);
const ergoEventTriggerExtractorLogger = WinstonLogger.getInstance().getLogger(
  'ergo-event-trigger-extractor'
);
const cardanoEventTriggerExtractorLogger =
  WinstonLogger.getInstance().getLogger('cardano-event-trigger-extractor');

/**
 * register event trigger extractors for all chains
 * @param scanner
 */
export const registerExtractors = (scanner: ErgoScanner) => {
  try {
    const ergoEventTriggerExtractor = new EventTriggerExtractor(
      'ergo-extractor',
      dataSource,
      configs.ergo.addresses.eventTrigger,
      configs.ergo.tokens.rwt,
      configs.ergo.addresses.permit,
      configs.ergo.addresses.fraud,
      ergoEventTriggerExtractorLogger
    );
    const cardanoEventTriggerExtractor = new EventTriggerExtractor(
      'cardano-extractor',
      dataSource,
      configs.cardano.addresses.eventTrigger,
      configs.cardano.tokens.rwt,
      configs.cardano.addresses.permit,
      configs.cardano.addresses.fraud,
      cardanoEventTriggerExtractorLogger
    );

    scanner.registerExtractor(ergoEventTriggerExtractor);
    scanner.registerExtractor(cardanoEventTriggerExtractor);

    logger.debug('event trigger extractors registered', {
      scannerName: scanner.name(),
      extractorNames: [
        ergoEventTriggerExtractor.getId(),
        cardanoEventTriggerExtractor.getId(),
      ],
    });
  } catch (error) {
    throw new AppError(
      `cannot create or register event trigger extractors due to error: ${error}`,
      false,
      'error',
      error instanceof Error ? error.stack : undefined,
      {
        scannerName: scanner.name(),
      }
    );
  }
};

const eventTriggerService = {
  registerExtractors,
};

export default eventTriggerService;
