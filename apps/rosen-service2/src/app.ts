import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';
import { ServiceManager } from '@rosen-bridge/service-manager';

import dataSource from './data-source';
import { DBService } from './services/db';

const logger = CallbackLoggerFactory.getInstance().getLogger(import.meta.url);

/**
 * Main function for running the Rosen-Service2
 *
 * @return
 */
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
