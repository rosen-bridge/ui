import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import {
  Dependency,
  ServiceAction,
  ServiceStatus,
} from '@rosen-bridge/service-manager';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import { TotalSupply } from '@rosen-ui/asset-aggregator';
import {
  BinanceEvmRpcDataAdapter,
  BitcoinEsploraDataAdapter,
  BitcoinRunesDataAdapter,
  CardanoKoiosDataAdapter,
  DogeBlockCypherDataAdapter,
  ErgoExplorerDataAdapter,
  EthereumEvmRpcDataAdapter,
} from '@rosen-ui/asset-data-adapter';
import { AssetBalance } from '@rosen-ui/asset-data-adapter/dist/types';
import { NETWORKS, NETWORKS_KEYS } from '@rosen-ui/constants';
import { createClient, VercelKV } from '@vercel/kv';

import { configs } from '../configs';
import { TOTAL_SUPPLY_REDIS_KEY } from '../constants';
import { ChainChoices } from '../types';
import { stringSerializer } from '../utils';
import {
  AbstractAssetDataAdapterService,
  AbstractTokenMapService,
} from './abstracts';

export class AssetDataAdapterService extends AbstractAssetDataAdapterService {
  static serviceName = AbstractAssetDataAdapterService.name;
  protected redis: VercelKV;
  protected explorerApi: ReturnType<typeof ergoExplorerClientFactory>;
  protected dependencies: Dependency[] = [
    {
      serviceName: AbstractTokenMapService.name,
      allowedStatuses: [ServiceStatus.running],
      action: ServiceAction.start,
    },
  ];

  /**
   * Assembles the service by initializing dependencies
   * @async
   * @returns {Promise<boolean>} Resolves to `true` when the assembly is successfully completed.
   */
  protected assemble = async (): Promise<boolean> => {
    this.redis = createClient({
      url: configs.redis.address,
      token: configs.redis.token,
    });
    this.explorerApi = ergoExplorerClientFactory(
      configs.chains.ergo.explorer.connections.at(0)!.url,
    );
    await this.createDataAdapters();
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
   * calculate total supply of the wrapped-tokens
   *
   * @returns { {[chain: string]: TotalSupply[]} }
   */
  getAssetsTotalSupply = async (): Promise<{
    [chain: string]: TotalSupply[];
  }> => {
    const assets: { [chain: string]: TotalSupply[] } = {};
    for (const chain of NETWORKS_KEYS) {
      const adapter = this.adapters[chain];
      if (adapter) {
        try {
          assets[chain] = await adapter.getAllTokensTotalSupply();
        } catch (error) {
          this.logger.error(
            `Failed to get total supply for ${chain}: ${error}`,
          );
          assets[chain] = [];
        }
      }
    }

    return assets;
  };

  /**
   * Creates and returns a blockchain-specific data adapter instance.
   *
   * Supported chains:
   * - Ergo     (Explorer, Node)
   * - Cardano  (Blockfrost, Ogmios, Koios)
   * - Bitcoin  (Esplora, RPC)
   * - Bitcoin-Runs  (Esplora, RPC)
   * - Doge     (Esplora, RPC)
   * - Ethereum (EVM RPC)
   * - Binance  (RPC)
   *
   * const adapter = createDataAdapter(NETWORKS.bitcoin.key, { url: "https://blockstream.info" });
   *
   * @async
   * @returns {Promise<void>}
   */
  protected createDataAdapters = async () => {
    try {
      const tokenMap = AbstractTokenMapService.getInstance().getTokenMap();
      (Object.keys(configs.chains) as ChainChoices[]).forEach((chain) => {
        const addresses: string[] = [
          configs.contracts[chain].addresses.lock,
          configs.contracts[chain].addresses.cold,
          ...(configs.chains[chain].adapter?.extraAddresses ?? []),
        ].filter(Boolean);
        if (chain === NETWORKS.ergo.key || configs.chains[chain].active) {
          switch (chain) {
            case NETWORKS.ergo.key:
              this.adapters[NETWORKS[chain].key] = new ErgoExplorerDataAdapter(
                addresses,
                tokenMap,
                {
                  explorerUrl:
                    configs.chains.ergo.explorer.connections.at(0)!.url,
                },
                this.logger.child(`ergoDataAdapter`),
              );
              break;
            case NETWORKS.bitcoin.key:
              this.adapters[NETWORKS[chain].key] =
                new BitcoinEsploraDataAdapter(
                  addresses,
                  tokenMap,
                  {
                    url: configs.chains.bitcoin.esplora.connections.at(0)!.url,
                  },
                  this.logger.child('bitcoinDataAdapter'),
                );
              break;
            case NETWORKS['bitcoin-runes'].key:
              this.adapters[NETWORKS[chain].key] = new BitcoinRunesDataAdapter(
                addresses,
                tokenMap,
                configs.chains['bitcoin-runes'].unisatUrl,
                configs.chains['bitcoin-runes'].unisatApiKey,
                this.logger.child('bitcoinRunesDataAdapter'),
              );
              break;
            case NETWORKS.ethereum.key:
              this.adapters[NETWORKS[chain].key] =
                new EthereumEvmRpcDataAdapter(
                  addresses,
                  tokenMap,
                  {
                    url: configs.chains.ethereum.rpc.connections.at(0)!.url!,
                    authToken:
                      configs.chains.ethereum.rpc.connections.at(0)?.authToken,
                  },
                  configs.chains.ethereum.adapter.chunkSize,
                  this.logger.child('ethereumDataAdapter'),
                );
              break;
            case NETWORKS.binance.key:
              this.adapters[NETWORKS[chain].key] = new BinanceEvmRpcDataAdapter(
                addresses,
                tokenMap,
                {
                  url: configs.chains.binance.rpc.connections.at(0)!.url!,
                  authToken:
                    configs.chains.binance.rpc.connections.at(0)?.authToken,
                },
                configs.chains.binance.adapter.chunkSize,
                this.logger.child('binanceDataAdapter'),
              );
              break;
            case NETWORKS.cardano.key:
              this.adapters[NETWORKS[chain].key] = new CardanoKoiosDataAdapter(
                addresses,
                tokenMap,
                {
                  koiosUrl: configs.chains.cardano.koios.connections.at(0)!.url,
                  authToken: configs.chains.cardano.koios.connections
                    .at(0)
                    ?.authToken?.toString(),
                },
                this.logger.child('cardanoDataAdapter'),
              );
              break;
            case NETWORKS.doge.key:
              this.adapters[NETWORKS[chain].key] =
                new DogeBlockCypherDataAdapter(
                  addresses,
                  tokenMap,
                  {
                    blockCypherUrl: configs.chains.doge.adapter.blockCypher.url,
                  },
                  this.logger.child('dogeDataAdapter'),
                );
              break;
          }
        }
      });
    } catch (error) {
      this.logger.error(
        `Failed to create data-adaptors: ${error instanceof Error ? error.message : error}`,
      );
      if (error instanceof Error && error.stack) {
        this.logger.debug(error.stack);
      }
    }
  };

  /**
   * initializes the singleton instance of AssetDataAdapterService
   *
   * @static
   * @param {AbstractLogger} [logger]
   * @memberof AssetDataAdapterService
   */
  static readonly init = async (logger?: AbstractLogger) => {
    if (AbstractAssetDataAdapterService.instance != undefined) {
      return;
    }
    AbstractAssetDataAdapterService.instance = new AssetDataAdapterService(
      logger,
    );
  };

  /**
   * write assets total-supply to the redis
   *
   * @returns void
   */
  protected preStart = async () => {
    const assets = await this.getAssetsTotalSupply();
    await this.redis.set(TOTAL_SUPPLY_REDIS_KEY, stringSerializer(assets));
  };

  /**
   * Updates and merges EVM-chain (Ethereum/Binance) data in Redis.
   * @param {ChainChoices} chain - The chain name of data adapter
   * @returns {AssetBalance}
   * @protected
   */
  protected evmChainDataUpdated = async (
    chain: ChainChoices,
  ): Promise<AssetBalance> => {
    const adapter = this.adapters[chain];
    const oldData =
      (await this.redis.get<AssetBalance | null>(adapter.chain)) || {};
    const newData = await adapter.fetch();
    const finalData = { ...oldData };
    for (const tokenId of Object.keys(newData)) {
      if (!Object.hasOwn(finalData, tokenId)) {
        finalData[tokenId] = newData[tokenId];
      } else {
        newData[tokenId].forEach((item, index) => {
          const finalItemIndex = finalData[tokenId]
            .map((addressBalance) => addressBalance?.address)
            .indexOf(item?.address);
          if (finalItemIndex >= 0) {
            finalData[tokenId][index] = newData[tokenId][finalItemIndex];
          } else {
            finalData[tokenId].push(item);
          }
        });
      }
    }
    return finalData;
  };

  /**
   * Builds a list of asynchronous tasks for active chains.
   *
   * @returns {Task[]}
   */
  protected getTasks = () => {
    const tasks = [];
    for (const adapter of Object.values(this.adapters)) {
      tasks.push({
        fn:
          adapter.chain == NETWORKS.ethereum.key ||
          adapter.chain == NETWORKS.binance.key
            ? async () => {
                // preventing of overriding old chunks of data
                await this.redis.set(
                  adapter.chain,
                  stringSerializer(
                    await this.evmChainDataUpdated(adapter.chain),
                  ),
                );
              }
            : async () => {
                await this.redis.set(
                  adapter.chain,
                  stringSerializer(await adapter.fetch()),
                );
              },
        interval: configs.dataAggregator.interval * 1000,
      });
    }
    return tasks;
  };

  /**
   * Performs necessary cleanup after stopping the service,
   *
   * @returns void
   */
  protected postStop = async () => {};
}
