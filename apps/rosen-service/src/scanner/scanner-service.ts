import WinstonLogger from '@rosen-bridge/winston-logger/dist/WinstonLogger';

import { startCardanoScanner } from './chains/cardano';
import { startErgoScanner } from './chains/ergo';

import observationService from '../observation/observation-service';
import eventTriggerService from '../event-trigger/event-trigger-service';

import { handleError } from '../utils';

const logger = WinstonLogger.getInstance().getLogger(import.meta.url);

/**
 * start all scanners and register their extractors
 */
const start = async () => {
  try {
    const [ergoScanner, cardanoScanner] = await Promise.all([
      startErgoScanner(),
      startCardanoScanner(),
    ]);

    logger.debug('all scanners started and their extractors registered', {
      scannerNames: [ergoScanner.name(), cardanoScanner.name()],
    });
  } catch (error) {
    handleError(error);
  }
};

const scannerService = {
  start,
};

export default scannerService;
