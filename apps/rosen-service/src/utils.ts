import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';
import { TokenMap } from '@rosen-bridge/tokens';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import AppError from './errors/AppError';

const logger = CallbackLoggerFactory.getInstance().getLogger(import.meta.url);

/**
 * get token map instance
 */
export const getTokenMap = async (): Promise<TokenMap> => {
  const tokensMapFilePath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../config/tokensMap.json',
  );

  if (fs.existsSync(tokensMapFilePath)) {
    const { tokens } = JSON.parse(
      fs.readFileSync(tokensMapFilePath, {
        encoding: 'utf-8',
      }),
    );

    const tokenMap = new TokenMap();

    await tokenMap.updateConfigByJson(tokens);

    return tokenMap;
  }

  throw new Error(`Tokens map file not found in the path ${tokensMapFilePath}`);
};

export const handleError = (
  error: unknown,
  logger: AbstractLogger,
  customHandler?: (error: AppError) => void,
) => {
  if (!(error instanceof AppError) || !error.canBeHandled) {
    logger.error('an error occurred that cannot be handled');
    logger.error(
      `${error}`,
      error instanceof AppError ? error.context : undefined,
    );
    error instanceof Error && error.stack && logger.error(error.stack);
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
  interval: number,
) => {
  await job();

  setTimeout(() => {
    runAndSetInterval(job, interval);
  }, interval);
};
