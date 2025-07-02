import { ConfigValidator } from '@rosen-bridge/config';
import WinstonLogger from '@rosen-bridge/winston-logger';
import config from 'config';
import * as fs from 'fs';
import JsonBigIntFactory from 'json-bigint';
import path from 'path';
import { fileURLToPath } from 'url';

import { Configs, ContractsConfig } from '../types';

const logger = WinstonLogger.getInstance().getLogger(import.meta.url);

/**
 * validates configs using the config schema
 *
 * @return Configs
 */
const validateConfigs = (): Configs => {
  const JsonBigInt = JsonBigIntFactory({
    alwaysParseAsBig: false,
    useNativeBigInt: true,
  });

  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  const rawSchemaData = fs.readFileSync(
    path.join(__dirname, '../../config/schema.json'),
    'utf-8',
  );
  const schema = JsonBigInt.parse(rawSchemaData);
  const confValidator = new ConfigValidator(schema);

  const configs = config.util.toObject();
  confValidator.validateConfig(configs);
  for (const chain in Object.keys(configs.chains)) {
    if (chain == 'ergo' || configs.chains[chain].active) {
      let contractsData;
      try {
        contractsData = fs.readFileSync(
          path.join(__dirname, `../../config/rosen/contracts-${chain}.json`),
          'utf-8',
        );
      } catch (err) {
        logger.error(
          `Error occurred on reading ${chain} blockchain contracts: ${err}`,
        );
      }
      const confValidator = new ConfigValidator({
        lock: { type: 'string', validations: [{ required: true }] },
        eventTrigger: { type: 'string', validations: [{ required: true }] },
        permit: { type: 'string', validations: [{ required: true }] },
        fraud: { type: 'string', validations: [{ required: true }] },
      });
      const contractsConfig = JSON.parse(rawSchemaData);
      confValidator.validateConfig(contractsConfig);
      configs.chains[chain].contracts = contractsConfig;
    }
  }

  return configs;
};

export const configs = validateConfigs();
