import JsonBigInt from '@rosen-bridge/json-bigint';
import * as fs from 'node:fs';
import path from 'node:path';
import { exit } from 'node:process';
import { fileURLToPath } from 'node:url';

import { AllChainsConfigs } from '../types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class ContractConfigsReader {
  public data: AllChainsConfigs | undefined;

  constructor(protected contractsPath: string) {
    this.readConfigs();
  }

  /**
   * Read and return the Rosen-Service2 configs
   *
   * @return { AllChainsConfigs } RosenService2Config
   */
  protected readConfigs = (): AllChainsConfigs => {
    try {
      const filePath = path.join(__dirname, `../../${this.contractsPath}`);

      const raw = fs.readFileSync(filePath, 'utf-8');
      this.data = JsonBigInt.parse(raw) as AllChainsConfigs;
      return this.data;
    } catch (err) {
      console.error(
        `Error occurred on reading blockchain contracts: ${(err as Error).message}`,
      );
      exit(-1);
    }
  };
}
