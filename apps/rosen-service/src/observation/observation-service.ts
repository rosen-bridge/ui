import { registerBitcoinExtractor } from './chains/bitcoin';
import { registerCardanoExtractor } from './chains/cardano';
import { registerErgoExtractor } from './chains/ergo';
import { registerEthereumExtractor } from './chains/ethereum';

const observationService = {
  registerBitcoinExtractor,
  registerCardanoExtractor,
  registerErgoExtractor,
  registerEthereumExtractor,
};

export default observationService;
