import { PeriodicTaskService } from '@rosen-bridge/service-manager';

import type { ChainScannersType, Chains } from '../../types';

export abstract class AbstractScannerService extends PeriodicTaskService {
  static name = 'Scanner';
  protected static instance: AbstractScannerService;

  /**
   * Returns the singleton instance of AbstractScannerService
   *
   * @static
   * @return {AbstractScannerService}
   * @memberof AbstractScannerService
   */
  static getInstance = (): AbstractScannerService => {
    return AbstractScannerService.instance;
  };

  /**
   * Returns scanner instance for the given chain.
   *
   * @param {ChainsKeys} chain - Target chain key
   * @returns {ChainScannersType | undefined} Scanner instance for the chain
   */
  abstract getScanner: (chain: keyof Chains) => ChainScannersType | undefined;
}
