import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';

import dataSource from '../data-source';
import AppError from '../errors/AppError';
import { handleError } from '../utils';

const logger = CallbackLoggerFactory.getInstance().getLogger(import.meta.url);

process.on('SIGTERM', async () => {
  logger.debug(
    'termination signal received, graceful shutdown process starting',
  );
  await dataSource.destroy();
  logger.debug('data source destroyed');
  logger.info('shutting down service as a result of a termination signal');
  process.exit(0);
});

process.on('uncaughtException', async (error) => {
  const appError =
    error instanceof AppError
      ? error
      : new AppError(
          `an uncaught exception occurred, exiting immediately: ${error}`,
          false,
          'error',
          error instanceof Error ? error.stack : undefined,
        );

  handleError(appError);
});

process.on('unhandledRejection', async (reason) => {
  logger.warn('a promise rejected but not handled', {
    reason,
  });
});
