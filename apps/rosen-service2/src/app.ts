import { ServiceManager } from '@rosen-bridge/service-manager';
import WinstonLogger from '@rosen-bridge/winston-logger';

import dataSource from './data-source';
import { DBService } from './services/db';

const logger = WinstonLogger.getInstance().getLogger(import.meta.url);

const startApp = async () => {
  const serviceManager = ServiceManager.setup();

  logger.debug('Initializing database service');
  DBService.init(dataSource, logger);
  serviceManager.register(DBService.getInstance());
  logger.debug('Database service registered to the service manager');

  logger.debug('Starting service manager...');
  await serviceManager.start(DBService.getInstance().getName());
};

export default startApp;
