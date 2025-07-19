import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';

const logger = CallbackLoggerFactory.getInstance().getLogger(import.meta.url);

const startApp = () => {
  logger.info('The Rosen-Service2 Started');
};

export default startApp;
