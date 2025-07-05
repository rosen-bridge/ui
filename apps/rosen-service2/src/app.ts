import WinstonLogger from '@rosen-bridge/winston-logger';
import express from 'express';

const logger = WinstonLogger.getInstance().getLogger(import.meta.url);

const app = express();

app.use(express.json());

const startApp = () => {};

export default startApp;
