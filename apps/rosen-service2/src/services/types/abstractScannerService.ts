import { PeriodicTaskService } from '@rosen-bridge/service-manager';

import { ChainScannersType, Chains } from '../../types/index';

export abstract class AbstractScannerService extends PeriodicTaskService {
  protected static instance: AbstractScannerService;

  /**
   * return the singleton instance of AbstractScannerService
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
   * @returns {ExtraChainScannersType | undefined} Scanner instance for the chain
   */
  abstract getScanner: (chain: keyof Chains) => ChainScannersType | undefined;
}
