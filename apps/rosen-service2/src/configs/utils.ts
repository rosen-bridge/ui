import { ConfigValidator } from '@rosen-bridge/config';
import JsonBigInt from '@rosen-bridge/json-bigint';
import { TransportOptions } from '@rosen-bridge/winston-logger';
import config from 'config';
import * as fs from 'node:fs';
import path from 'node:path';
import { exit } from 'node:process';
import { fileURLToPath } from 'node:url';

import { AllChainsConfigs, Logs, RosenService2Configs } from '../types';

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
 * Reads and parses blockchain contract configurations from a specified JSON file.
 *
 * @param contractsPath - Relative path to the contracts configuration file.
 * @returns Parsed AllChainsConfigs object containing contract details.
 */
export const readContractConfigs = (
  contractsPath: string,
): AllChainsConfigs => {
  try {
    const filePath = path.join(__dirname, `../../${contractsPath}`);

    const raw = fs.readFileSync(filePath, 'utf-8');
    return JsonBigInt.parse(raw) as AllChainsConfigs;
  } catch (err) {
    console.error(
      `Error occurred on reading blockchain contracts: ${(err as Error).message}`,
    );
    exit(-1);
  }
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
  configs.contracts = readContractConfigs(configs.paths.contracts);

  return configs;
};
