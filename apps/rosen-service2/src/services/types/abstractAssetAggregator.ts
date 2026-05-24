import { PeriodicTaskService } from '@rosen-bridge/service-manager';

export abstract class AbstractAssetAggregatorServicce extends PeriodicTaskService {
  static Name = 'AssetAggregator';
  protected static instance: AbstractAssetAggregator;

  /**
   * return the singleton instance of AbstractAssetAggregator
   *
   * @static
   * @return {AbstractAssetAggregator}
   * @memberof AbstractAssetAggregator
   */
  static getInstance = (): AbstractAssetAggregator => {
    return AbstractAssetAggregator.instance;
  };
}
