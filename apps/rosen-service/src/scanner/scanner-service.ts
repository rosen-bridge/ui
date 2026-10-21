import { DefaultLogger } from '@rosen-bridge/abstract-logger';
import type { BitcoinCashRpcScanner } from '@rosen-bridge/bitcoin-cash-scanner';
import type { BitcoinRpcScanner, DogeRpcScanner } from '@rosen-bridge/bitcoin-scanner';
import type { CardanoKoiosScanner } from '@rosen-bridge/cardano-scanner';
import type { ErgoScanner } from '@rosen-bridge/ergo-scanner';
import type { EvmRpcScanner } from '@rosen-bridge/evm-scanner';
import type { FiroElectrumXScanner } from '@rosen-bridge/firo-scanner';
import type { HandshakeRpcScanner } from '@rosen-bridge/handshake-scanner';

import { handleError } from '../utils';
import { startBinanceScanner } from './chains/binance';
import { startBitcoinScanner } from './chains/bitcoin';
import { startBitcoinCashScanner } from './chains/bitcoin-cash';
import { startCardanoScanner } from './chains/cardano';
import { startDogeScanner } from './chains/doge';
import { startErgoScanner } from './chains/ergo';
import { startEthereumScanner } from './chains/ethereum';
import { startFiroScanner } from './chains/firo';
import { startHandshakeScanner } from './chains/handshake';

const logger = DefaultLogger.getInstance().child(import.meta.url);

// Scanner instances that will be initialized in start()
let ergoScanner: ErgoScanner;
let cardanoScanner: CardanoKoiosScanner;
let bitcoinScanner: BitcoinRpcScanner;
let ethereumScanner: EvmRpcScanner;
let binanceScanner: EvmRpcScanner;
let dogeScanner: DogeRpcScanner;
let firoScanner: FiroElectrumXScanner;
let handshakeScanner: HandshakeRpcScanner;
let bitcoinCashScanner: BitcoinCashRpcScanner | undefined;

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
      firoScanner,
      handshakeScanner,
      bitcoinCashScanner,
    ] = await Promise.all([
      startErgoScanner(),
      startCardanoScanner(),
      startBitcoinScanner(),
      startEthereumScanner(),
      startBinanceScanner(),
      startDogeScanner(),
      startFiroScanner(),
      startHandshakeScanner(),
      startBitcoinCashScanner(),
    ]);

    logger.debug('all scanners started and their extractors registered', {
      scannerNames: [
        ergoScanner.name(),
        cardanoScanner.name(),
        bitcoinScanner.name(),
        ethereumScanner.name(),
        binanceScanner.name(),
        dogeScanner.name(),
        firoScanner.name(),
        handshakeScanner.name(),
        ...(bitcoinCashScanner ? [bitcoinCashScanner.name()] : []),
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
  getFiroScanner: () => firoScanner,
  getHandshakeScanner: () => handshakeScanner,
  getBitcoinCashScanner: () => bitcoinCashScanner,
};

export default scannerService;
