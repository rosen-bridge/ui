import WinstonLogger from '@rosen-bridge/winston-logger';
import express from 'express';

import router from './router/v1';

const logger = WinstonLogger.getInstance().getLogger(import.meta.url);

const app = express();

app.use(express.json());

app.use('/v1', router);

const startApp = () => {};

export default startApp;
