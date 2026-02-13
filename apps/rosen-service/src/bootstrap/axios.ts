import { DefaultLogger } from '@rosen-bridge/abstract-logger';
import { RateLimitedAxiosConfig } from '@rosen-clients/rate-limited-axios';

import config from '../configs';

const logger = DefaultLogger.getInstance().child(import.meta.url);

config.doge.rpcConnections.forEach((rpcConfig) => {
  RateLimitedAxiosConfig.addRule(`^${rpcConfig.url}$`, 3, 1, 60);
});

RateLimitedAxiosConfig.setLogger(logger);
