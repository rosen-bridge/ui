import { ConfigValidator } from '@rosen-bridge/config';
import config from 'config';
import * as fs from 'fs';
import JsonBigIntFactory from 'json-bigint';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * validates configs using the config schema
 *
 * @return {[key: string]: string | object}
 */
const validateConfigs = (): { [key: string]: string | object } => {
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
  return configs;
};

export const configs = validateConfigs();
