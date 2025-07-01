import WinstonLogger from '@rosen-bridge/winston-logger';
import express from 'express';

import { apiPort, apiHost } from './configs';
import router from './router/v1';

const logger = WinstonLogger.getInstance().getLogger(import.meta.url);

const app = express();

app.use(express.json());

app.use('/v1', router);

const startApp = () => {
  app.listen(apiPort, apiHost, () => {
    logger.info(`Service started at http://${apiHost}:${apiPort}`);
  });
};

export default startApp;
