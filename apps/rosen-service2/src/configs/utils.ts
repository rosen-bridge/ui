import { ConfigValidator } from '@rosen-bridge/config';
import config from 'config';
import * as fs from 'fs';
import JsonBigIntFactory from 'json-bigint';
import path from 'path';
import { fileURLToPath } from 'url';

import { SUPPORTED_CHAINS } from '../constants';
import { Configs } from '../types';
import { ChainConfigsReader } from './chains';

const ERGO_CHAIN = 'ergo';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JsonBigInt = JsonBigIntFactory({
  alwaysParseAsBig: false,
  useNativeBigInt: true,
});

/**
 * validates configs using the config schema
 *
 * @return Configs
 */
export const validateConfigs = (): Configs => {
  const rawSchemaData = fs.readFileSync(
    path.join(__dirname, '../../config/schema.json'),
    'utf-8',
  );
  const schema = JsonBigInt.parse(rawSchemaData);
  const confValidator = new ConfigValidator(schema);
  const configs = config.util.toObject();
  confValidator.validateConfig(configs);

  // TODO: Must remove after adding the Ergo config segment
  configs.chains['ergo'] = {};
  for (const chain of SUPPORTED_CHAINS) {
    if (chain == ERGO_CHAIN || configs.chains[chain].active) {
      const chainConfigReader = new ChainConfigsReader(chain);
      configs.chains[chain].contracts = chainConfigReader.data;
    }
  }

  return configs;
};
