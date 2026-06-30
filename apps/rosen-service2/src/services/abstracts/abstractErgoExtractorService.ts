import { AbstractService } from '@rosen-bridge/service-manager';

export abstract class AbstractErgoExtractorsService extends AbstractService {
  protected static instance: AbstractErgoExtractorsService;
  static name = 'ErgoExtractor';

  /**
   * return the singleton instance of AbstractErgoExtractorsService
   *
   * @static
   * @return {AbstractErgoExtractorsService}
   * @memberof AbstractErgoExtractorsService
   */
  static getInstance = (): AbstractErgoExtractorsService => {
    return AbstractErgoExtractorsService.instance;
  };
}
