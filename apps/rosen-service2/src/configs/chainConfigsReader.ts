import JsonBigInt from '@rosen-bridge/json-bigint';
import * as fs from 'fs';
import path from 'path';
import { exit } from 'process';
import { fileURLToPath } from 'url';

import { ChainConfigs, ChainChoices } from '../types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class ChainConfigsReader {
  public data: ChainConfigs | undefined;

  constructor(
    protected chain: ChainChoices,
    protected contractsPath: string,
  ) {
    this.readConfigs();
  }

  /**
   * Read and return the Rosen-Service2 configs
   *
   * @return { ChainConfigs } RosenService2Config
   */
  protected readConfigs = (): ChainConfigs => {
    try {
      const contractsData = fs.readFileSync(
        path.join(
          __dirname,
          `../../${this.contractsPath}/contracts-${this.chain}.json`,
        ),
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
