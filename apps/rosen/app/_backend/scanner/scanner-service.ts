import { startCardanoScanner } from './chains/cardano';
import { startErgoScanner } from './chains/ergo';

/**
 * start all scanners
 */
const start = () => {
  startErgoScanner();
  startCardanoScanner();
};

const scannerService = {
  start,
};

export default scannerService;
