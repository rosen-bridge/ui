import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';
import { GeneralScanner } from '@rosen-bridge/scanner';

import AppError from '../errors/AppError';
import { handleError, runAndSetInterval } from '../utils';

/**
 * run scanner update periodically, handling probably errors
 * @param scanner
 * @param loggerFileName
 * @param updateInterval
 */
export const startScanner = async (
  scanner: GeneralScanner<any>,
  loggerFileName: string,
  updateInterval: number,
) => {
  const logger = CallbackLoggerFactory.getInstance().getLogger(loggerFileName);

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
        },
      );
      handleError(appError);
    }
  };

  await runAndSetInterval(tryUpdating, updateInterval);

  logger.debug('scanner update job run successfully', {
    scannerName: scanner.name(),
    interval: updateInterval,
  });
};
