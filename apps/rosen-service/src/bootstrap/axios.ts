import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';
import axios from '@rosen-bridge/rate-limited-axios';

import config from '../configs';

const logger = CallbackLoggerFactory.getInstance().getLogger(import.meta.url);

const dogeLimitRules = config.doge.rpcConnections.map((rpcConfig) => {
  return {
    pattern: `^${rpcConfig.url}$`,
    rateLimit: 3,
  };
});

axios.initConfigs(
  {
    apiLimitRateRangeAsSeconds: 1,
    apiLimitRules: dogeLimitRules,
  },
  logger,
);
