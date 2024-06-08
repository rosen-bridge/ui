import { registerBitcoinExtractor } from './chains/bitcoin';
import { registerCardanoExtractor } from './chains/cardano';
import { registerErgoExtractor } from './chains/ergo';

const observationService = {
  registerBitcoinExtractor,
  registerCardanoExtractor,
  registerErgoExtractor,
};

export default observationService;
