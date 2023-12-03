import { GeneralScanner } from '@rosen-bridge/scanner';
import WinstonLogger from '@rosen-bridge/winston-logger';

/**
 * run a job periodically, starting from now
 * @param job
 * @param interval
 */
const runAndSetInterval = (job: (...args: any[]) => any, interval: number) => {
  job();
  setInterval(job, interval);
};

/**
 * run scanner update periodically, handling probably errors
 * @param scanner
 * @param loggerFileName
 * @param updateInterval
 */
const startScannerUpdateJob = (
  scanner: GeneralScanner<any>,
  loggerFileName: string,
  updateInterval: number
) => {
  const logger = WinstonLogger.getInstance().getLogger(loggerFileName);

  const tryUpdating = () => {
    try {
      scanner.update();
    } catch (error) {
      logger.warn(`An error occurred while calling scanner update: ${error}`);
    }
  };

  runAndSetInterval(tryUpdating, updateInterval);
};

/**
 * start a scanner, initializing it and calling its update method periodically
 * @param scanner
 * @param loggerFileName
 * @param updateInterval
 */
export const startScanner = async (
  scanner: GeneralScanner<any>,
  loggerFileName: string,
  updateInterval: number
) => {
  await scanner.initialize();

  startScannerUpdateJob(scanner, loggerFileName, updateInterval);
};
