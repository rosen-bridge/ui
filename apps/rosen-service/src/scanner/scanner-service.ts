import WinstonLogger from '@rosen-bridge/winston-logger/dist/WinstonLogger';

import { handleError } from '../utils';
import { startBinanceScanner } from './chains/binance';
import { startBitcoinScanner } from './chains/bitcoin';
import { startCardanoScanner } from './chains/cardano';
import { startErgoScanner } from './chains/ergo';
import { startEthereumScanner } from './chains/ethereum';

const logger = WinstonLogger.getInstance().getLogger(import.meta.url);

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
    ] = await Promise.all([
      startErgoScanner(),
      startCardanoScanner(),
      startBitcoinScanner(),
      startEthereumScanner(),
      startBinanceScanner(),
    ]);

    logger.debug('all scanners started and their extractors registered', {
      scannerNames: [
        ergoScanner.name(),
        cardanoScanner.name(),
        bitcoinScanner.name(),
        ethereumScanner.name(),
        binanceScanner.name(),
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
