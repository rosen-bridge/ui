import WinstonLogger from '@rosen-bridge/winston-logger/dist/WinstonLogger';

import { startBitcoinScanner } from './chains/bitcoin';
import { startCardanoScanner } from './chains/cardano';
import { startErgoScanner } from './chains/ergo';

import { handleError } from '../utils';

const logger = WinstonLogger.getInstance().getLogger(import.meta.url);

/**
 * start all scanners and register their extractors
 */
const start = async () => {
  try {
    const [ergoScanner, cardanoScanner, bitcoinScanner] = await Promise.all([
      startErgoScanner(),
      startCardanoScanner(),
      startBitcoinScanner(),
    ]);

    logger.debug('all scanners started and their extractors registered', {
      scannerNames: [
        ergoScanner.name(),
        cardanoScanner.name(),
        bitcoinScanner.name(),
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
