import {
  AggregatedStatusAction,
  AggregatedStatusChangedAction,
  DataSourceHandler,
  GuardStatusAction,
  GuardStatusChangedAction,
  TxAction,
} from '@rosen-bridge/public-status-logic';

import { configs } from './configs';

await DataSourceHandler.init(configs.postgresUrl, configs.postgresUseSSL);
await AggregatedStatusChangedAction.init();
await AggregatedStatusAction.init();
await GuardStatusChangedAction.init();
await GuardStatusAction.init();
await TxAction.init();
