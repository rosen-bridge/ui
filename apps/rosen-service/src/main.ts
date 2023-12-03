import './bootstrap';

import WinstonLogger from '@rosen-bridge/winston-logger';

import scannerService from './scanner/scanner-service';

import dataSource from './data-source';

const logger = WinstonLogger.getInstance().getLogger(import.meta.url);

await dataSource.initialize();
logger.info('data source initialized successfully');

await dataSource.runMigrations();

scannerService.start();
