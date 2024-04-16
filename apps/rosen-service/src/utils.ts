import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import WinstonLogger from '@rosen-bridge/winston-logger';

import AppError from './errors/AppError';

const logger = WinstonLogger.getInstance().getLogger(import.meta.url);

/**
 * get rosen tokens object from tokensMap file or throw error if file is missing
 */
export const getRosenTokens = () => {
  const tokensMapFilePath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../config/tokensMap.json'
  );

  if (fs.existsSync(tokensMapFilePath)) {
    const tokensMap = JSON.parse(
      fs.readFileSync(tokensMapFilePath, {
        encoding: 'utf-8',
      })
    );
    return tokensMap;
  }

  throw new Error(`Tokens map file not found in the path ${tokensMapFilePath}`);
};

export const handleError = (
  error: unknown,
  customHandler?: (error: AppError) => void
) => {
  if (!(error instanceof AppError) || !error.canBeHandled) {
    logger.error('an error occurred that cannot be handled');
    logger.error(
      `${error}`,
      error instanceof AppError ? error.context : undefined
    );
    logger.error('shutting down service');
    process.exit(1);
  }

  logger[error.severity](error.message, error.context);
  logger.debug(error.stack);

  customHandler?.(error);
};

/**
 * run a job periodically, starting from now
 * @param job
 * @param interval
 */
export const runAndSetInterval = async (
  job: () => unknown,
  interval: number
) => {
  await job();

  setTimeout(() => {
    runAndSetInterval(job, interval);
  }, interval);
};
