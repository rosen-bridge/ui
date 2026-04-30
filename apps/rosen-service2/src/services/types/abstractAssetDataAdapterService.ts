import { PeriodicTaskService } from '@rosen-bridge/service-manager';
import { TotalSupply } from '@rosen-ui/asset-aggregator';
import { ChainsAdapters } from '@rosen-ui/asset-data-adapter';

export abstract class AbstractAssetDataAdapterService extends PeriodicTaskService {
  protected static instance: AbstractAssetDataAdapterService;
  protected adapters: { [key: string]: ChainsAdapters } = {};

  /**
   * return the singleton instance of AbstractAssetDataAdapterService
   *
   * @static
   * @return {AbstractAssetDataAdapterService}
   * @memberof AbstractAssetDataAdapterService
   */
  static getInstance = (): AbstractAssetDataAdapterService => {
    return AbstractAssetDataAdapterService.instance;
  };

  /**
   * calculate total supply of the wrapped-tokens
   *
   * @returns { {[chain: string]: TotalSupply[]} }
   */
  abstract getAssetsTotalSupply: () => Promise<{
    [chain: string]: TotalSupply[];
  }>;
}
