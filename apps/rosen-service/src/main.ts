import WinstonLogger from '@rosen-bridge/winston-logger';

import './bootstrap';
import calculatorService from './calculator/calculator-service';
import dataSource from './data-source';
import AppError from './errors/AppError';
import scannerService from './scanner/scanner-service';
import { handleError } from './utils';

const logger = WinstonLogger.getInstance().getLogger(import.meta.url);

const main = async () => {
  try {
    try {
      await dataSource.initialize();
      logger.debug('data source initialized successfully');
    } catch (error) {
      throw new AppError(
        `cannot initialize data source due to error: ${error}`,
        false,
        'error',
        error instanceof Error ? error.stack : undefined,
      );
    }

    try {
      await dataSource.runMigrations();
      logger.debug('migrations ran successfully');
    } catch (error) {
      throw new AppError(
        `cannot run database migrations due to error: ${error}`,
        false,
        'error',
        error instanceof Error ? error.stack : undefined,
      );
    }

    await Promise.all([
      calculatorService.start().then(() => {
        logger.info('calculator service started successfully');
      }),
      scannerService.start().then(() => {
        logger.info('scanner service started successfully');
      }),
    ]);
  } catch (error) {
    handleError(error);
  }
};

main();
