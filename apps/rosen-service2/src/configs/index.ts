import { ConfigValidator } from '@rosen-bridge/config';
import WinstonLogger from '@rosen-bridge/winston-logger';
import config from 'config';
import * as fs from 'fs';
import JsonBigIntFactory from 'json-bigint';
import path from 'path';
import { exit } from 'process';
import { fileURLToPath } from 'url';

import { SUPPORTED_CHAINS } from '../constants';
import { Configs } from '../types';

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

  const rawContractSchemaData = fs.readFileSync(
    path.join(__dirname, '../../config/schema-contract.json'),
    'utf-8',
  );
  const contractSchema = JsonBigInt.parse(rawContractSchemaData);
  const contractConfValidator = new ConfigValidator(contractSchema);

  configs.chains['ergo'] = {};
  for (const chain of SUPPORTED_CHAINS) {
    if (chain == 'ergo' || configs.chains[chain].active) {
      let contractsData: string;
      try {
        contractsData = fs.readFileSync(
          path.join(__dirname, `../../config/rosen/contracts-${chain}.json`),
          'utf-8',
        );
        const contractsConfig = JsonBigInt.parse(contractsData);
        contractsConfig['chain'] = chain;
        contractConfValidator.validateConfig(contractsConfig);
        configs.chains[chain].contracts = contractsConfig;
      } catch (err) {
        console.error(
          `Error occurred on reading ${chain} blockchain contracts: ${(err as Error).message}`,
        );
        exit(-1);
      }
    }
  }

  return configs;
};

export const configs = validateConfigs();
