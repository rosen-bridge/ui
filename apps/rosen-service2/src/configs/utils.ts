import * as fs from 'node:fs';
import path from 'node:path';
import { exit } from 'node:process';
import { fileURLToPath } from 'node:url';

import { ConfigValidator } from '@rosen-bridge/config';
import JsonBigInt from '@rosen-bridge/json-bigint';

import type { AllChainsConfigs, RosenService2Configs } from '../types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Reads and parses blockchain contract configurations from a specified JSON file.
 *
 * @param contractsPath - Relative path to the contracts configuration file.
 * @returns Parsed AllChainsConfigs object containing contract details.
 */
export const readContractConfigs = (contractsPath: string): AllChainsConfigs => {
  try {
    const filePath = path.join(__dirname, `../../${contractsPath}`);

    const raw = fs.readFileSync(filePath, 'utf-8');
    return JsonBigInt.parse(raw) as AllChainsConfigs;
  } catch (err) {
    console.error(`Error occurred on reading blockchain contracts: ${(err as Error).message}`);
    exit(-1);
  }
};

/**
 * validates configs using the config schema
 *
 * @return RosenService2Configs
 */
export const validateConfigs = (): RosenService2Configs => {
  const confValidator = ConfigValidator.fromFile(path.join(__dirname, '../../config/schema.json'));
  const configs = confValidator.buildConfigs<RosenService2Configs>();
  configs.contracts = readContractConfigs(configs.paths.contracts);

  return configs;
};
