import { ConfigValidator } from '@rosen-bridge/config';
import JsonBigInt from '@rosen-bridge/json-bigint';
import { NETWORKS, NETWORKS_KEYS } from '@rosen-ui/constants';
import config from 'config';
import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { RoseService2Config } from '../types';
import { ChainConfigsReader } from './ChainConfigsReader';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * validates configs using the config schema
 *
 * @return RoseService2Config
 */
export const validateConfigs = (): RoseService2Config => {
  const rawSchemaData = fs.readFileSync(
    path.join(__dirname, '../../config/schema.json'),
    'utf-8',
  );
  const schema = JsonBigInt.parse(rawSchemaData);
  const confValidator = new ConfigValidator(schema);
  const configs = config.util.toObject();
  confValidator.validateConfig(configs);

  // TODO: Must remove after adding the Ergo config segment
  configs.chains[NETWORKS.ergo.key] = {};
  for (const chain of NETWORKS_KEYS) {
    if (chain == NETWORKS.ergo.key || configs.chains[chain].active) {
      const chainConfigReader = new ChainConfigsReader(chain);
      configs.chains[chain].contracts = chainConfigReader.data;
    }
  }

  return configs;
};
