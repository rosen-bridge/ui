import { ServiceManager } from '@rosen-bridge/service-manager';
import WinstonLogger from '@rosen-bridge/winston-logger';

import dataSource from './data-source';
import { DBService } from './services/db';

const logger = WinstonLogger.getInstance().getLogger(import.meta.url);

const startApp = async () => {
  const serviceManager = ServiceManager.setup();

  logger.debug('Initializing database service');
  await dataSource.initialize();
  DBService.init(dataSource, logger);
  serviceManager.register(DBService.getInstance());
  logger.debug('Database service registered to the service manager');
};

export default startApp;
