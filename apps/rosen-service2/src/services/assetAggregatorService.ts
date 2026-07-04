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

import { configs } from '../configs';
import { TOTAL_SUPPLY_REDIS_KEY } from '../constants';
import { ChainChoices, ChainsKeys } from '../types';
import {
  AbstractAssetAggregatorService,
  AbstractAssetDataAdapterService,
  AbstractTokenMapService,
  AbstractDBService,
} from './abstracts';
import { AbstractRedisService } from './abstracts/abstractRedisService';

export class AssetAggregatorService extends AbstractAssetAggregatorService {
  static serviceName = AbstractAssetAggregatorService.name;
  protected assetAggregator: AssetAggregator;

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
      serviceName: AbstractRedisService.name,
      allowedStatuses: [ServiceStatus.running, ServiceStatus.started],
      action: ServiceAction.start,
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
   * Initializes the singleton instance of AssetAggregatorService
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
   * Writes assets total-supply to the redis
   *
   * @returns void
   */
  protected preStart = async () => {
    await this.assetAggregator.updateTokens();
  };

  /**
   * Fetches balances from Redis for all active chains and updates the asset aggregator.
   *
   */
  protected aggregateActiveChainBalances = async () => {
    const assetBalances: Partial<Record<NetworkItem, AssetBalance>> = {};

    await Promise.all(
      Object.keys(configs.chains).map(async (chainKey) => {
        const chain = chainKey as ChainsKeys;
        if (chain === NETWORKS.ergo.key || configs.chains[chain].active) {
          const data =
            await AbstractRedisService.getInstance().getFromRedis<AssetBalance>(
              chainKey,
            );
          if (data) {
            assetBalances[chain as ChainChoices] = data;
          }
        }
      }),
    );

    const totalSupply: { [chain: string]: TotalSupply[] } =
      (await AbstractRedisService.getInstance().getFromRedis<{
        [chain: string]: TotalSupply[];
      }>(TOTAL_SUPPLY_REDIS_KEY)) ?? {};

    await this.assetAggregator.update(assetBalances, totalSupply);
  };

  /**
   * Builds a list of asynchronous tasks for active chains.
   *
   * @returns {Task[]}
   */
  protected getTasks = () => {
    return [
      {
        fn: this.aggregateActiveChainBalances,
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
