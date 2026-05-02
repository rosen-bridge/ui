import { ErgoScanner } from '@rosen-bridge/ergo-scanner';
import { PeriodicTaskService } from '@rosen-bridge/service-manager';

export abstract class AbstractErgoScannerService extends PeriodicTaskService {
  protected static instance: AbstractErgoScannerService;
  static Name = 'ErgoScannerService';

  /**
   * return the singleton instance of AbstractErgoScannerService
   *
   * @static
   * @return {AbstractErgoScannerService}
   * @memberof AbstractErgoScannerService
   */
  static getInstance = (): AbstractErgoScannerService => {
    return AbstractErgoScannerService.instance;
  };

  /**
   * Returns the underlying ErgoScanner instance.
   * @returns {ErgoScanner} The scanner instance.
   */
  abstract getErgoScanner: () => ErgoScanner;
}
