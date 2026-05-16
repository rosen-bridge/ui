import { registerBinanceExtractor } from './chains/binance';
import { registerBitcoinExtractor } from './chains/bitcoin';
import { registerBitcoinRunesExtractor } from './chains/bitcoin-runes';
import { registerCardanoExtractor } from './chains/cardano';
import { registerDogeExtractor } from './chains/doge';
import { registerErgoExtractor } from './chains/ergo';
import { registerEthereumExtractor } from './chains/ethereum';
import { registerFiroExtractor } from './chains/firo';

const observationService = {
  registerBitcoinExtractor,
  registerBitcoinRunesExtractor,
  registerDogeExtractor,
  registerCardanoExtractor,
  registerErgoExtractor,
  registerEthereumExtractor,
  registerBinanceExtractor,
  registerFiroExtractor,
};

export default observationService;
