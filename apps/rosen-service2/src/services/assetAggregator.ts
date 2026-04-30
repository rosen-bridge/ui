import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import {
  Dependency,
  ServiceAction,
  ServiceStatus,
} from '@rosen-bridge/service-manager';
import {
  AssetAggregator,
  NetworkItem,
  TotalSupply,
} from '@rosen-ui/asset-aggregator';
import { AssetBalance } from '@rosen-ui/asset-data-adapter';
import { NETWORKS } from '@rosen-ui/constants';
import { createClient } from '@vercel/kv';

import { configs } from '../configs';
import { TOTAL_SUPPLY_REDIS_KEY } from '../constants';
import { ChainChoices } from '../types';
import { AbstractAssetAggregator } from './types/abstractAssetAggregator';
import { AbstractAssetDataAdapterService } from './types/abstractAssetDataAdapterService';
import { AbstractTokenMapService } from './types/abstractTokenMapService';
import { AbstractDBService } from './types/abstrctDb';

export class AssetAggregatorService extends AbstractAssetAggregator {
  name = 'AssetAggregatorService';
  private assetAggregator: AssetAggregator;
  readonly redis;

  protected dependencies: Dependency[] = [
    {
      serviceName: AbstractAssetDataAdapterService.getInstance().getName(),
      allowedStatuses: [ServiceStatus.running],
      action: ServiceAction.start,
    },
    {
      serviceName: AbstractTokenMapService.getInstance().getName(),
      allowedStatuses: [ServiceStatus.running, ServiceStatus.dormant],
      action: ServiceAction.assemble,
    },
    {
      serviceName: AbstractDBService.getInstance().getName(),
      allowedStatuses: [ServiceStatus.running, ServiceStatus.dormant],
      action: ServiceAction.assemble,
    },
  ];

  assemble = async (): Promise<boolean> => {
    this.assetAggregator = new AssetAggregator(
      AbstractTokenMapService.getInstance().getTokenMap(),
      AbstractDBService.getInstance().getDataSource(),
      this.logger,
    );
    this.setStatus(ServiceStatus.dormant);
    return true;
  };

  private constructor(logger?: AbstractLogger) {
    super(logger);
    this.redis = createClient({
      url: configs.redis.address,
      token: configs.redis.token,
    });
  }

  /**
   * initializes the singleton instance of AssetAggregatorService
   *
   * @static
   * @param {AbstractLogger} [logger]
   * @memberof AssetAggregatorService
   */
  static readonly init = async (logger?: AbstractLogger) => {
    if (AbstractAssetAggregator.instance != undefined) {
      return;
    }
    AbstractAssetAggregator.instance = new AssetAggregatorService(logger);
  };

  /**
   * write assets total-supply to the redis
   *
   * @returns void
   */
  protected preStart = async () => {
    await this.assetAggregator.updateTokens();
  };

  /**
   * Builds a list of asynchronous tasks for active chains.
   *
   * @returns {Task[]}
   */
  protected getTasks = () => {
    return [
      {
        fn: async () => {
          const assetBalances: Partial<Record<NetworkItem, AssetBalance>> = {};
          await Promise.all(
            Object.keys(configs.chains).map(async (chain) => {
              const chainConfig = configs.chains[chain as ChainChoices];
              if (
                chain == NETWORKS.ergo.key ||
                ('active' in chainConfig && chainConfig.active)
              ) {
                const data = await this.redis.get<AssetBalance | null>(chain);
                if (data) assetBalances[chain as ChainChoices] = data;
              }
            }),
          );
          const totalSupply: { [chain: string]: TotalSupply[] } =
            (await this.redis.get(TOTAL_SUPPLY_REDIS_KEY)) ?? {};
          await this.assetAggregator.update(assetBalances, totalSupply);
        },
        interval: configs.dataAggregator.interval * 1000,
      },
    ];
  };

  /**
   * Performs necessary cleanup after stopping the service,
   *
   * @returns void
   */
  protected postStop = async () => {};
}
