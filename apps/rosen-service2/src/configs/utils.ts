import { ConfigValidator } from '@rosen-bridge/config';
import { TransportOptions } from '@rosen-bridge/winston-logger';
import config from 'config';
import * as fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Logs, RosenService2Configs } from '../types';
import { ContractConfigsReader } from './contractConfigsReader';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Converts log configurations to an array of TransportOptions based on their type.
 *
 * @param configs - Configuration object with log settings.
 * @returns List of TransportOptions for logger setup.
 */
export const getLogOptions = (logConfigs: Logs[] = []): TransportOptions[] => {
  const logOptions: TransportOptions[] = [];
  for (const log of logConfigs) {
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
          serviceName: log.serviceName,
          host: log.host!,
          basicAuth: log.basicAuth,
        });
        break;
    }
  }
  return logOptions;
};

/**
 * validates configs using the config schema
 *
 * @return RosenService2Configs
 */
export const validateConfigs = (): RosenService2Configs => {
  const rawSchemaData = fs.readFileSync(
    path.join(__dirname, '../../config/schema.json'),
    'utf-8',
  );
  const schema = JSON.parse(rawSchemaData);
  const confValidator = new ConfigValidator(schema);
  const configs = config.util.toObject();
  confValidator.validateConfig(configs);

  configs.contracts = {};
  // TODO: implement Bitcoin-Runes support later
  const chainConfigReader = new ContractConfigsReader(configs.paths.contracts);
  configs.contracts = chainConfigReader.data;

  return configs;
};
