import {
  BitcoinRpcScanner,
  DogeRpcScanner,
} from '@rosen-bridge/bitcoin-scanner';
import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';
import { CardanoKoiosScanner } from '@rosen-bridge/cardano-scanner';
import { ErgoScanner } from '@rosen-bridge/ergo-scanner';
import { EvmRpcScanner } from '@rosen-bridge/evm-scanner';

import { handleError } from '../utils';
import { startBinanceScanner } from './chains/binance';
import { startBitcoinScanner } from './chains/bitcoin';
import { startCardanoScanner } from './chains/cardano';
import { startDogeScanner } from './chains/doge';
import { startErgoScanner } from './chains/ergo';
import { startEthereumScanner } from './chains/ethereum';

const logger = CallbackLoggerFactory.getInstance().getLogger(import.meta.url);

// Scanner instances that will be initialized in start()
let ergoScanner: ErgoScanner;
let cardanoScanner: CardanoKoiosScanner;
let bitcoinScanner: BitcoinRpcScanner;
let ethereumScanner: EvmRpcScanner;
let binanceScanner: EvmRpcScanner;
let dogeScanner: DogeRpcScanner;

/**
 * start all scanners and register their extractors
 */
const start = async () => {
  try {
    [
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
    handleError(error, logger);
  }
};

const scannerService = {
  start,
  // Export scanner instances
  getErgoScanner: () => ergoScanner,
  getCardanoScanner: () => cardanoScanner,
  getBitcoinScanner: () => bitcoinScanner,
  getEthereumScanner: () => ethereumScanner,
  getBinanceScanner: () => binanceScanner,
  getDogeScanner: () => dogeScanner,
};

export default scannerService;
