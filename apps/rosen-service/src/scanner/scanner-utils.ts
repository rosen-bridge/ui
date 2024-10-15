import { GeneralScanner } from '@rosen-bridge/scanner';
import WinstonLogger from '@rosen-bridge/winston-logger';

import { handleError, runAndSetInterval } from '../utils';

import AppError from '../errors/AppError';

/**
 * run scanner update periodically, handling probably errors
 * @param scanner
 * @param loggerFileName
 * @param updateInterval
 */
export const startScanner = (
  scanner: GeneralScanner<any>,
  loggerFileName: string,
  updateInterval: number
) => {
  const logger = WinstonLogger.getInstance().getLogger(loggerFileName);

  const tryUpdating = async () => {
    try {
      await scanner.update();
      logger.debug('scanner update called successfully', {
        scannerName: scanner.name(),
      });
    } catch (error) {
      const appError = new AppError(
        `scanner update failed due to error: ${error}`,
        true,
        'warn',
        error instanceof Error ? error.stack : undefined,
        {
          scannerName: scanner.name(),
        }
      );
      handleError(appError);
    }
  };

  runAndSetInterval(tryUpdating, updateInterval);

  logger.debug('scanner update job run successfully', {
    scannerName: scanner.name(),
    interval: updateInterval,
  });
};
