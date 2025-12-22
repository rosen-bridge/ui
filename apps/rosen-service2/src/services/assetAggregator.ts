import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import {
  Dependency,
  PeriodicTaskService,
  ServiceStatus,
} from '@rosen-bridge/service-manager';
import { AssetAggregator, NetworkItem } from '@rosen-ui/asset-aggregator';
import { AssetBalance } from '@rosen-ui/asset-data-adapter';
import { NETWORKS } from '@rosen-ui/constants';
import { createClient } from '@vercel/kv';

import { configs } from '../configs';
import { TokensConfig } from '../tokensConfig';
import { ChainChoices, TotalSupply } from '../types';
import { AssetDataAdapterService } from './assetDataAdapters';
import { DBService } from './db';

export class AssetAggregatorService extends PeriodicTaskService {
  name = 'AssetAggregatorService';
  taskName = 'AssetAggregatorService';
  readonly assetAggregator;
  private static instance: AssetAggregatorService;
  readonly dbService: DBService;
  readonly redis;

  protected dependencies: Dependency[] = [
    {
      serviceName: AssetDataAdapterService.name,
      allowedStatuses: [ServiceStatus.running],
    },
  ];

  private constructor(logger?: AbstractLogger) {
    super(logger);
    this.dbService = DBService.getInstance();
    this.redis = createClient({
      url: configs.redis.address,
      token: configs.redis.token,
    });
    this.assetAggregator = new AssetAggregator(
      TokensConfig.getInstance().getTokenMap(),
      this.dbService.dataSource,
      this.logger,
    );
  }

  /**
   * initializes the singleton instance of AssetAggregatorService
   *
   * @static
   * @param {AbstractLogger} [logger]
   * @memberof AssetAggregatorService
   */
  static readonly init = async (logger?: AbstractLogger) => {
    if (this.instance != undefined) {
      return;
    }
    this.instance = new AssetAggregatorService(logger);
  };

  /**
   * return the singleton instance of AssetAggregatorService
   *
   * @static
   * @return {AssetAggregatorService}
   * @memberof AssetAggregatorService
   */
  static readonly getInstance = (): AssetAggregatorService => {
    if (!this.instance) {
      throw new Error(
        'AssetAggregatorService instances is not initialized yet',
      );
    }
    return this.instance;
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
            Object.values(Object.keys(configs.chains)).map(async (chain) => {
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
          const totalSupply: TotalSupply[] =
            (await this.redis.get('total_supply')) ?? [];
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
