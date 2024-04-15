import './bootstrap';

import WinstonLogger from '@rosen-bridge/winston-logger';

import scannerService from './scanner/scanner-service';

import dataSource from './data-source';

import { handleError } from './utils';

import AppError from './errors/AppError';
import calculatorService from './calculator/calculator-service';

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
        error instanceof Error ? error.stack : undefined
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
        error instanceof Error ? error.stack : undefined
      );
    }

    await scannerService.start();
    await calculatorService.start();
    logger.info('scanner service started successfully');
  } catch (error) {
    handleError(error);
  }
};

main();
