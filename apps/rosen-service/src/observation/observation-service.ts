import { registerBinanceExtractor } from './chains/binance';
import { registerBitcoinExtractor } from './chains/bitcoin';
import { registerBitcoinRunesExtractor } from './chains/bitcoin-runes';
import { registerCardanoExtractor } from './chains/cardano';
import { registerDogeExtractor } from './chains/doge';
import { registerErgoExtractor } from './chains/ergo';
import { registerEthereumExtractor } from './chains/ethereum';
import { registerHandshakeExtractor } from './chains/handshake';

const observationService = {
  registerBitcoinExtractor,
  registerBitcoinRunesExtractor,
  registerDogeExtractor,
  registerHandshakeExtractor,
  registerCardanoExtractor,
  registerErgoExtractor,
  registerEthereumExtractor,
  registerBinanceExtractor,
};

export default observationService;
