import { ErgoNetworkType } from '@rosen-bridge/abstract-extractor';
import { ErgoScanner } from '@rosen-bridge/scanner';
import { EventTriggerExtractor } from '@rosen-bridge/watcher-data-extractor';
import WinstonLogger from '@rosen-bridge/winston-logger';

import configs from '../configs';
import dataSource from '../data-source';
import AppError from '../errors/AppError';

const logger = WinstonLogger.getInstance().getLogger(import.meta.url);
const ergoEventTriggerExtractorLogger = WinstonLogger.getInstance().getLogger(
  'ergo-event-trigger-extractor',
);
const cardanoEventTriggerExtractorLogger =
  WinstonLogger.getInstance().getLogger('cardano-event-trigger-extractor');
const bitcoinEventTriggerExtractorLogger =
  WinstonLogger.getInstance().getLogger('bitcoin-event-trigger-extractor');
const ethereumEventTriggerExtractorLogger =
  WinstonLogger.getInstance().getLogger('ethereum-event-trigger-extractor');
const binanceEventTriggerExtractorLogger =
  WinstonLogger.getInstance().getLogger('binance-event-trigger-extractor');

/**
 * register event trigger extractors for all chains
 * @param scanner
 */
export const registerExtractors = async (scanner: ErgoScanner) => {
  try {
    const ergoEventTriggerExtractor = new EventTriggerExtractor(
      'ergo-extractor',
      dataSource,
      ErgoNetworkType.Explorer,
      configs.ergo.explorerUrl,
      configs.ergo.addresses.eventTrigger,
      configs.ergo.tokens.rwt,
      configs.ergo.addresses.permit,
      configs.ergo.addresses.fraud,
      ergoEventTriggerExtractorLogger,
    );
    const cardanoEventTriggerExtractor = new EventTriggerExtractor(
      'cardano-extractor',
      dataSource,
      ErgoNetworkType.Explorer,
      configs.ergo.explorerUrl,
      configs.cardano.addresses.eventTrigger,
      configs.cardano.tokens.rwt,
      configs.cardano.addresses.permit,
      configs.cardano.addresses.fraud,
      cardanoEventTriggerExtractorLogger,
    );
    const bitcoinEventTriggerExtractor = new EventTriggerExtractor(
      'bitcoin-extractor',
      dataSource,
      ErgoNetworkType.Explorer,
      configs.ergo.explorerUrl,
      configs.bitcoin.addresses.eventTrigger,
      configs.bitcoin.tokens.rwt,
      configs.bitcoin.addresses.permit,
      configs.bitcoin.addresses.fraud,
      bitcoinEventTriggerExtractorLogger,
    );
    const ethereumEventTriggerExtractor = new EventTriggerExtractor(
      'ethereum-extractor',
      dataSource,
      ErgoNetworkType.Explorer,
      configs.ergo.explorerUrl,
      configs.ethereum.addresses.eventTrigger,
      configs.ethereum.tokens.rwt,
      configs.ethereum.addresses.permit,
      configs.ethereum.addresses.fraud,
      ethereumEventTriggerExtractorLogger,
    );
    const binanceEventTriggerExtractor = new EventTriggerExtractor(
      'binance-extractor',
      dataSource,
      ErgoNetworkType.Explorer,
      configs.ergo.explorerUrl,
      configs.binance.addresses.eventTrigger,
      configs.binance.tokens.rwt,
      configs.binance.addresses.permit,
      configs.binance.addresses.fraud,
      binanceEventTriggerExtractorLogger,
    );

    await scanner.registerExtractor(ergoEventTriggerExtractor);
    await scanner.registerExtractor(cardanoEventTriggerExtractor);
    await scanner.registerExtractor(bitcoinEventTriggerExtractor);
    await scanner.registerExtractor(ethereumEventTriggerExtractor);
    await scanner.registerExtractor(binanceEventTriggerExtractor);

    logger.debug('event trigger extractors registered', {
      scannerName: scanner.name(),
      extractorNames: [
        ergoEventTriggerExtractor.getId(),
        cardanoEventTriggerExtractor.getId(),
        bitcoinEventTriggerExtractor.getId(),
        ethereumEventTriggerExtractor.getId(),
        binanceEventTriggerExtractor.getId(),
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
      },
    );
  }
};

const eventTriggerService = {
  registerExtractors,
};

export default eventTriggerService;
