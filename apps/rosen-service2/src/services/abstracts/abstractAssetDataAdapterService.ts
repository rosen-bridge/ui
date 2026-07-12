import { PeriodicTaskService } from '@rosen-bridge/service-manager';
import type { TotalSupply } from '@rosen-ui/asset-aggregator';
import type { ChainsAdapters } from '@rosen-ui/asset-data-adapter';

export abstract class AbstractAssetDataAdapterService extends PeriodicTaskService {
  protected static instance: AbstractAssetDataAdapterService;
  static name = 'AssetDataAdapter';
  protected adapters: { [key: string]: ChainsAdapters } = {};

  /**
   * Returns the singleton instance of AbstractAssetDataAdapterService
   *
   * @static
   * @return {AbstractAssetDataAdapterService}
   * @memberof AbstractAssetDataAdapterService
   */
  static getInstance = (): AbstractAssetDataAdapterService => {
    return AbstractAssetDataAdapterService.instance;
  };

  /**
   * Calculates total supply of the wrapped-tokens
   *
   * @returns { {[chain: string]: TotalSupply[]} }
   */
  abstract getAssetsTotalSupply: () => Promise<{
    [chain: string]: TotalSupply[];
  }>;
}
