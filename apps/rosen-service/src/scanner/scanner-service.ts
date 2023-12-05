import { startCardanoScanner } from './chains/cardano';
import { startErgoScanner } from './chains/ergo';

import observationService from '../observation/observation-service';
import eventTriggerService from '../event-trigger/event-trigger-service';

/**
 * start all scanners and register their extractors
 */
const start = async () => {
  const [ergoScanner, cardanoScanner] = await Promise.all([
    startErgoScanner(),
    startCardanoScanner(),
  ]);

  observationService.registerErgoExtractor(ergoScanner);
  observationService.registerCardanoExtractor(cardanoScanner);
  eventTriggerService.registerExtractors(ergoScanner);
};

const scannerService = {
  start,
};

export default scannerService;
