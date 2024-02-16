import WinstonLogger from '@rosen-bridge/winston-logger/dist/WinstonLogger';

import dataSource from '../data-source';

import { handleError } from '../utils';

import AppError from '../errors/AppError';

const logger = WinstonLogger.getInstance().getLogger(import.meta.url);

process.on('SIGTERM', async () => {
  logger.debug(
    'termination signal received, graceful shutdown process starting'
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
          error instanceof Error ? error.stack : undefined
        );

  handleError(appError);
});

process.on('unhandledRejection', async (reason) => {
  logger.warn('a promise rejected but not handled', {
    reason,
  });
});
