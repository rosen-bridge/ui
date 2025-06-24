import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';
import { RateLimitedAxiosConfig } from '@rosen-bridge/rate-limited-axios';

import config from '../configs';

const logger = CallbackLoggerFactory.getInstance().getLogger(import.meta.url);

config.doge.rpcConnections.forEach((rpcConfig) => {
  RateLimitedAxiosConfig.addRule(`^${rpcConfig.url}$`, 3, 1);
});

RateLimitedAxiosConfig.setLogger(logger);
