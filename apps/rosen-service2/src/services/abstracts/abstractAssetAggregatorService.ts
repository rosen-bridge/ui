import { PeriodicTaskService } from '@rosen-bridge/service-manager';

export abstract class AbstractAssetAggregatorService extends PeriodicTaskService {
  static name = 'AssetAggregator';
  protected static instance: AbstractAssetAggregatorService;

  /**
   * Returns the singleton instance of AbstractAssetAggregator
   *
   * @static
   * @return {AbstractAssetAggregator}
   * @memberof AbstractAssetAggregator
   */
  static getInstance = (): AbstractAssetAggregatorService => {
    return AbstractAssetAggregatorService.instance;
  };
}
