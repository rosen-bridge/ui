import { registerBinanceExtractor } from './chains/binance';
import { registerBitcoinExtractor } from './chains/bitcoin';
import { registerCardanoExtractor } from './chains/cardano';
import { registerDogeExtractor } from './chains/doge';
import { registerErgoExtractor } from './chains/ergo';
import { registerEthereumExtractor } from './chains/ethereum';
import { registerRunesExtractor } from './chains/runes';

const observationService = {
  registerBitcoinExtractor,
  registerRunesExtractor,
  registerDogeExtractor,
  registerCardanoExtractor,
  registerErgoExtractor,
  registerEthereumExtractor,
  registerBinanceExtractor,
};

export default observationService;
