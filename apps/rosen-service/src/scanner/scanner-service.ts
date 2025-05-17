import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';

import { handleError } from '../utils';
import { startBinanceScanner } from './chains/binance';
import { startBitcoinScanner } from './chains/bitcoin';
import { startCardanoScanner } from './chains/cardano';
import { startDogeScanner } from './chains/doge';
import { startErgoScanner } from './chains/ergo';
import { startEthereumScanner } from './chains/ethereum';

const logger = CallbackLoggerFactory.getInstance().getLogger(import.meta.url);

/**
 * start all scanners and register their extractors
 */
const start = async () => {
  try {
    const [
      ergoScanner,
      cardanoScanner,
      bitcoinScanner,
      ethereumScanner,
      binanceScanner,
      dogeScanner,
    ] = await Promise.all([
      startErgoScanner(),
      startCardanoScanner(),
      startBitcoinScanner(),
      startEthereumScanner(),
      startBinanceScanner(),
      startDogeScanner(),
    ]);

    logger.debug('all scanners started and their extractors registered', {
      scannerNames: [
        ergoScanner.name(),
        cardanoScanner.name(),
        bitcoinScanner.name(),
        ethereumScanner.name(),
        binanceScanner.name(),
        dogeScanner.name(),
      ],
    });
  } catch (error) {
    handleError(error);
  }
};

const scannerService = {
  start,
};

export default scannerService;
