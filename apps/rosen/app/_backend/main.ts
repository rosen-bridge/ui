import './bootstrap';

import WinstonLogger from '@rosen-bridge/winston-logger';

import dataSource from './dataSource';

const logger = WinstonLogger.getInstance().getLogger(import.meta.url);

await dataSource.initialize();
logger.info('data source initialized successfully');

dataSource.runMigrations();
