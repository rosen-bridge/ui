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
import { createClient, VercelKV } from '@vercel/kv';

import { configs } from '../configs';
import { TOTAL_SUPPLY_REDIS_KEY } from '../constants';
import { ChainChoices } from '../types';
import {
  AbstractAssetAggregatorService,
  AbstractAssetDataAdapterService,
  AbstractTokenMapService,
  AbstractDBService,
} from './abstracts';

export class AssetAggregatorService extends AbstractAssetAggregatorService {
  name = AbstractAssetAggregatorService.name;
  protected assetAggregator: AssetAggregator;
  protected redis: VercelKV;

  protected dependencies: Dependency[] = [
    {
      serviceName: AbstractAssetDataAdapterService.name,
      allowedStatuses: [ServiceStatus.running],
      action: ServiceAction.start,
    },
    {
      serviceName: AbstractTokenMapService.name,
      allowedStatuses: [
        ServiceStatus.running,
        ServiceStatus.started,
        ServiceStatus.dormant,
      ],
      action: ServiceAction.assemble,
    },
    {
      serviceName: AbstractDBService.name,
      allowedStatuses: [
        ServiceStatus.running,
        ServiceStatus.started,
        ServiceStatus.dormant,
      ],
      action: ServiceAction.assemble,
    },
  ];

  /**
   * Assembles the service by initializing dependencies
   * @async
   * @returns {Promise<boolean>} Resolves to `true` when the assembly is successfully completed.
   */
  protected assemble = async (): Promise<boolean> => {
    this.assetAggregator = new AssetAggregator(
      AbstractTokenMapService.getInstance().getTokenMap(),
      AbstractDBService.getInstance().getDataSource(),
      this.logger.child('assetAggregator'),
    );
    this.redis = createClient({
      url: configs.redis.address,
      token: configs.redis.token,
    });
    this.setStatus(ServiceStatus.dormant);
    return true;
  };

  /**
   * Protected constructor
   * @param {AbstractLogger} [logger] - Optional logger instance for recording service operations.
   */
  protected constructor(logger?: AbstractLogger) {
    super(logger);
  }

  /**
   * initializes the singleton instance of AssetAggregatorService
   *
   * @static
   * @param {AbstractLogger} [logger]
   * @memberof AssetAggregatorService
   */
  static readonly init = async (logger?: AbstractLogger) => {
    if (AbstractAssetAggregatorService.instance != undefined) {
      return;
    }
    AbstractAssetAggregatorService.instance = new AssetAggregatorService(
      logger,
    );
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
