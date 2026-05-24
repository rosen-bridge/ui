import { PeriodicTaskService } from '@rosen-bridge/service-manager';

export abstract class AbstractAssetAggregatorServicce extends PeriodicTaskService {
  static name = 'AssetAggregator';
  protected static instance: AbstractAssetAggregatorServicce;

  /**
   * return the singleton instance of AbstractAssetAggregator
   *
   * @static
   * @return {AbstractAssetAggregator}
   * @memberof AbstractAssetAggregator
   */
  static getInstance = (): AbstractAssetAggregatorServicce => {
    return AbstractAssetAggregatorServicce.instance;
  };
}
