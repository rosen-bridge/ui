import WinstonLogger from '@rosen-bridge/winston-logger';

import config from '../configs';

WinstonLogger.init(config.logs);
