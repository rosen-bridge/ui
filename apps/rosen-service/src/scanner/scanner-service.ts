import WinstonLogger from '@rosen-bridge/winston-logger/dist/WinstonLogger';

import { startCardanoScanner } from './chains/cardano';
import { startErgoScanner } from './chains/ergo';

import observationService from '../observation/observation-service';
import eventTriggerService from '../event-trigger/event-trigger-service';

const logger = WinstonLogger.getInstance().getLogger(import.meta.url);

/**
 * start all scanners and register their extractors
 */
const start = async () => {
  const [ergoScanner, cardanoScanner] = await Promise.all([
    startErgoScanner(),
    startCardanoScanner(),
  ]);

  logger.debug('all scanners started', {
    scannerNames: [ergoScanner.name(), cardanoScanner.name()],
  });

  observationService.registerErgoExtractor(ergoScanner);
  observationService.registerCardanoExtractor(cardanoScanner);
  eventTriggerService.registerExtractors(ergoScanner);

  logger.debug('all extractors registered to their corresponding scanner');
};

const scannerService = {
  start,
};

export default scannerService;
