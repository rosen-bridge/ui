import { DataSourceHandler } from '@rosen-bridge/public-status-logic';

import { configs } from './configs';

await DataSourceHandler.init(configs.postgresUrl, configs.postgresUseSSL);
