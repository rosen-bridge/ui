import { registerCardanoExtractor } from './chains/cardano';
import { registerErgoExtractor } from './chains/ergo';

const observationService = {
  registerCardanoExtractor,
  registerErgoExtractor,
};

export default observationService;
