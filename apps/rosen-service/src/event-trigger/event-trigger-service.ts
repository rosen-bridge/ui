import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';
import { ErgoScanner } from '@rosen-bridge/ergo-scanner';
import { ErgoNetworkType } from '@rosen-bridge/scanner-interfaces';
import { EventTriggerExtractor } from '@rosen-bridge/watcher-data-extractor';

import configs from '../configs';
import dataSource from '../data-source';
import AppError from '../errors/AppError';

const logger = CallbackLoggerFactory.getInstance().getLogger(import.meta.url);
const ergoEventTriggerExtractorLogger =
  CallbackLoggerFactory.getInstance().getLogger('ergo-event-trigger-extractor');
const cardanoEventTriggerExtractorLogger =
  CallbackLoggerFactory.getInstance().getLogger(
    'cardano-event-trigger-extractor',
  );
const bitcoinEventTriggerExtractorLogger =
  CallbackLoggerFactory.getInstance().getLogger(
    'bitcoin-event-trigger-extractor',
  );
const bitcoinRunesEventTriggerExtractorLogger =
  CallbackLoggerFactory.getInstance().getLogger(
    'bitcoin-runes-event-trigger-extractor',
  );
const ethereumEventTriggerExtractorLogger =
  CallbackLoggerFactory.getInstance().getLogger(
    'ethereum-event-trigger-extractor',
  );
const binanceEventTriggerExtractorLogger =
  CallbackLoggerFactory.getInstance().getLogger(
    'binance-event-trigger-extractor',
  );
const dogeEventTriggerExtractorLogger =
  CallbackLoggerFactory.getInstance().getLogger('doge-event-trigger-extractor');

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
    const bitcoinRunesEventTriggerExtractor = new EventTriggerExtractor(
      'bitcoin-runes-extractor',
      dataSource,
      ErgoNetworkType.Explorer,
      configs.ergo.explorerUrl,
      configs.bitcoinRunes.addresses.eventTrigger,
      configs.bitcoinRunes.tokens.rwt,
      configs.bitcoinRunes.addresses.permit,
      configs.bitcoinRunes.addresses.fraud,
      bitcoinRunesEventTriggerExtractorLogger,
    );
    const dogeEventTriggerExtractor = new EventTriggerExtractor(
      'doge-extractor',
      dataSource,
      ErgoNetworkType.Explorer,
      configs.ergo.explorerUrl,
      configs.doge.addresses.eventTrigger,
      configs.doge.tokens.rwt,
      configs.doge.addresses.permit,
      configs.doge.addresses.fraud,
      dogeEventTriggerExtractorLogger,
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
    await scanner.registerExtractor(bitcoinRunesEventTriggerExtractor);
    await scanner.registerExtractor(dogeEventTriggerExtractor);
    await scanner.registerExtractor(ethereumEventTriggerExtractor);
    await scanner.registerExtractor(binanceEventTriggerExtractor);

    logger.debug('event trigger extractors registered', {
      scannerName: scanner.name(),
      extractorNames: [
        ergoEventTriggerExtractor.getId(),
        cardanoEventTriggerExtractor.getId(),
        bitcoinEventTriggerExtractor.getId(),
        bitcoinRunesEventTriggerExtractor.getId(),
        dogeEventTriggerExtractor.getId(),
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
