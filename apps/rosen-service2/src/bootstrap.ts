import '@rosen-bridge/extended-typeorm/bootstrap';

import { DefaultLogger } from '@rosen-bridge/abstract-logger';
import { chainDecoders, chainValidators } from '@rosen-bridge/address-codec';
import { AddressManager } from '@rosen-bridge/address-manager';
import CallbackLogger from '@rosen-bridge/callback-logger';
import WinstonLogger from '@rosen-bridge/winston-logger';

import { configs, getLogOptions } from './configs';

DefaultLogger.init(
  new CallbackLogger(WinstonLogger.createLogger(getLogOptions(configs.logs))),
);

AddressManager.init(
  chainValidators,
  chainDecoders,
  DefaultLogger.getInstance().child('addressManager'),
);
