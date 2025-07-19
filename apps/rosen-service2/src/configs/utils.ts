import { ConfigValidator } from '@rosen-bridge/config';
import JsonBigInt from '@rosen-bridge/json-bigint';
import { TransportOptions } from '@rosen-bridge/winston-logger';
import { NETWORKS, NETWORKS_KEYS } from '@rosen-ui/constants';
import config from 'config';
import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { RosenService2Config, RosenService2Configs } from '../types';
import { ChainConfigsReader } from './ChainConfigsReader';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const getLogOptions = (
  configs: RosenService2Config,
): TransportOptions[] => {
  const logOptions: TransportOptions[] = [];
  for (const log of configs.logs) {
    switch (log.type) {
      case 'console':
        logOptions.push({
          type: log.type,
          level: log.level,
        });
        break;
      case 'file':
        logOptions.push({
          type: log.type,
          level: log.level,
          path: log.path!,
          maxSize: log.maxSize!,
          maxFiles: log.maxFiles!,
        });
        break;
      case 'loki':
        logOptions.push({
          type: log.type,
          level: log.level,
          host: log.host!,
        });
        break;
    }
  }
  return logOptions;
};

/**
 * validates configs using the config schema
 *
 * @return RosenService2Config
 */
export const validateConfigs = (): RosenService2Configs => {
  const rawSchemaData = fs.readFileSync(
    path.join(__dirname, '../../config/schema.json'),
    'utf-8',
  );
  const schema = JsonBigInt.parse(rawSchemaData);
  const confValidator = new ConfigValidator(schema);
  const configs = config.util.toObject();
  confValidator.validateConfig(configs);

  configs.contracts = {};
  for (const chain of NETWORKS_KEYS) {
    if (chain == NETWORKS.ergo.key || configs.chains[chain].active) {
      const chainConfigReader = new ChainConfigsReader(chain);
      configs.contracts[chain] = chainConfigReader.data;
    }
  }

  return configs;
};
