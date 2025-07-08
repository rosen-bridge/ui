import { ConfigValidator } from '@rosen-bridge/config';
import WinstonLogger from '@rosen-bridge/winston-logger';
import { NETWORKS_KEYS } from '@rosen-ui/constants';
import config from 'config';
import * as fs from 'fs';
import JsonBigIntFactory from 'json-bigint';
import path from 'path';
import { exit } from 'process';
import { fileURLToPath } from 'url';

import { ChainConfigs, Configs } from '../types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const JsonBigInt = JsonBigIntFactory({
  alwaysParseAsBig: false,
  useNativeBigInt: true,
});

export class ChainConfigsReader {
  public data: ChainConfigs | undefined;

  constructor(protected chain: (typeof NETWORKS_KEYS)[number]) {
    this.readConfigs();
  }

  protected readConfigs = (): ChainConfigs => {
    try {
      const contractsData = fs.readFileSync(
        path.join(__dirname, `../../config/rosen/contracts-${this.chain}.json`),
        'utf-8',
      );
      const contractsConfig = JsonBigInt.parse(contractsData) as ChainConfigs;
      this.data = contractsConfig;
      return contractsConfig;
    } catch (err) {
      console.error(
        `Error occurred on reading ${this.chain} blockchain contracts: ${(err as Error).message}`,
      );
      exit(-1);
    }
  };
}
