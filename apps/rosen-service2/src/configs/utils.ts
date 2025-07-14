import { ConfigValidator } from '@rosen-bridge/config';
import JsonBigInt from '@rosen-bridge/json-bigint';
import { NETWORKS, NETWORKS_KEYS } from '@rosen-ui/constants';
import config from 'config';
import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { RoseService2Configs } from '../types';
import { ChainConfigsReader } from './ChainConfigsReader';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * validates configs using the config schema
 *
 * @return RoseService2Configs
 */
export const validateConfigs = (): RoseService2Configs => {
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
