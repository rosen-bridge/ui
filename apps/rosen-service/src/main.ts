import './bootstrap';

import WinstonLogger from '@rosen-bridge/winston-logger';

import scannerService from './scanner/scanner-service';

import dataSource from './data-source';

const logger = WinstonLogger.getInstance().getLogger(import.meta.url);

await dataSource.initialize();
logger.debug('data source initialized successfully');

await dataSource.runMigrations();
logger.debug('migrations ran successfully');

await scannerService.start();
logger.info('scanner service started successfully');

process.on('SIGTERM', async () => {
  logger.debug('termination signal received, exiting gracefully');
  await dataSource.destroy();
  logger.debug('data source destroyed');
  logger.info('shutting down service as a result of a termination signal');
  process.exit(0);
});

process.on('uncaughtException', async (error) => {
  logger.error('an uncaught exception occurred, exiting immediately', {
    errorMessage: error.message,
    error,
  });
  logger.error('shutting down service as a result of an uncaught exception');
  process.exit(1);
});

process.on('unhandledRejection', async (reason) => {
  logger.warn('a promise rejected but not handled', {
    reason,
  });
});
