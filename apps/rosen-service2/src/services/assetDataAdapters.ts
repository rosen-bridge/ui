import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';
import JsonBigInt from '@rosen-bridge/json-bigint';
import {
  Dependency,
  PeriodicTaskService,
  ServiceStatus,
} from '@rosen-bridge/service-manager';
import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import {
  BinanceEvmRpcDataAdapter,
  BitcoinEsploraDataAdapter,
  CardanoKoiosDataAdapter,
  DogeBlockCypherDataAdapter,
  ErgoExplorerDataAdapter,
  EthereumEvmRpcDataAdapter,
} from '@rosen-ui/asset-data-adapter';
import { ChainsAdapters } from '@rosen-ui/asset-data-adapter';
import { NETWORKS } from '@rosen-ui/constants';
import { createClient } from '@vercel/kv';

import { configs } from '../configs';
import { ERG_TOTAL_SUPPLY } from '../constants';
import { TokensConfig } from '../tokensConfig';
import { ChainChoices, Chains, TotalSupply } from '../types';
import { DBService } from './db';

export class AssetDataAdapterService extends PeriodicTaskService {
  name = 'AssetDataAdapterService';
  taskName = 'AssetDataAdapterService';
  private static instance: AssetDataAdapterService;
  readonly dbService: DBService;
  readonly redis;
  protected adapters: { [key: string]: ChainsAdapters } = {};
  protected explorerApi;
  protected dependencies: Dependency[] = [
    {
      serviceName: DBService.name,
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
    this.explorerApi = ergoExplorerClientFactory(
      configs.chains.ergo.explorer.connections.at(0)!.url,
    );
    this.createDataAdapters();
  }

  /**
   * @param token Ergo chain token info
   *
   * @returns {Promise<TotalSupply[]>} total supply of the token in Ergo
   */
  getAssetsTotalSupply = async (): Promise<TotalSupply[]> => {
    const tokenMap = TokensConfig.getInstance().getTokenMap();
    const rosenTokens = tokenMap.getConfig();
    const assets = (
      await Promise.all(
        Object.values(rosenTokens).map(async (token) => {
          let tokenId = Object.entries(token)[0][1].tokenId;
          const tokenSet = tokenMap.getTokenSet(tokenId);
          if (!tokenSet || !tokenSet[NETWORKS.ergo.key]) return undefined;
          tokenId = tokenSet[NETWORKS.ergo.key].tokenId;
          if (tokenId == NETWORKS.ergo.nativeToken) {
            return {
              assetId: tokenId,
              totalSupply: ERG_TOTAL_SUPPLY,
            };
          }
          const tokenDetail =
            await this.explorerApi.v1.getApiV1TokensP1(tokenId);
          if (tokenDetail) {
            this.logger.debug(
              `Total supply of token [${tokenId}] is [${tokenDetail.emissionAmount}]`,
            );
            return {
              assetId: tokenId,
              totalSupply: tokenMap.wrapAmount(
                tokenId,
                tokenDetail.emissionAmount,
                NETWORKS.ergo.key,
              ).amount,
            };
          }
          throw Error(
            `Total supply of token [${token.tokenId}] is not calculable`,
          );
        }),
      )
    ).filter((asset) => asset != undefined);
    return assets;
  };

  /**
   * Creates and returns a blockchain-specific data adapter instance.
   *
   * @param chain - The target blockchain identifier (e.g., 'ergo', 'bitcoin', etc.)
   * @param authParams - An object containing authentication parameters required by the adapter
   * @returns An instance of the corresponding data adapter for the specified chain
   *
   * @throws Error if no adapter class exists for the given chain
   *
   * @example
   * const adapter = createDataAdapter(NETWORKS.bitcoin.key, { url: "https://blockstream.info" });
   */
  protected createChainSpecificDataAdapter = (
    chain: ChainChoices,
    authParams: { [key: string]: string },
  ) => {
    const Adapter = {
      [NETWORKS.ergo.key]: ErgoExplorerDataAdapter,
      [NETWORKS.bitcoin.key]: BitcoinEsploraDataAdapter,
      [NETWORKS.ethereum.key]: undefined,
      [NETWORKS.binance.key]: undefined,
      [NETWORKS.cardano.key]: CardanoKoiosDataAdapter,
      [NETWORKS.doge.key]: DogeBlockCypherDataAdapter,
    }[chain];

    const tokenMap = TokensConfig.getInstance().getTokenMap();

    const addresses: string[] = [
      configs.contracts[chain].addresses.lock,
      configs.contracts[chain].addresses.cold,
      ...(configs.chains[chain].adapter?.extraAddresses ?? []),
    ].filter(Boolean);

    if (chain === NETWORKS.ethereum.key)
      return new EthereumEvmRpcDataAdapter(
        addresses,
        tokenMap,
        authParams,
        configs.chains.ethereum.adapter.chunkSize,
        CallbackLoggerFactory.getInstance().getLogger('ethereum-data-adapter'),
      );
    else if (chain === NETWORKS.binance.key)
      return new BinanceEvmRpcDataAdapter(
        addresses,
        tokenMap,
        authParams,
        configs.chains.binance.adapter.chunkSize,
        CallbackLoggerFactory.getInstance().getLogger('binance-data-adapter'),
      );

    if (!Adapter) throw new Error(`No adapter class found for chain: ${chain}`);

    return new Adapter(
      addresses,
      tokenMap,
      authParams,
      CallbackLoggerFactory.getInstance().getLogger(`{chain}-data-adapter`),
    );
  };

  /**
   * Generates and registers blockchain scanners along with their corresponding event extractors
   * based on the active chains and configured methods.
   *
   * Supported chains:
   * - Ergo     (Explorer, Node)
   * - Cardano  (Blockfrost, Ogmios, Koios)
   * - Bitcoin  (Esplora, RPC)
   * - Doge     (Esplora, RPC)
   * - Ethereum (EVM RPC)
   * - Binance  (RPC)
   *
   * Each scanner will be initialized with its event extractors
   * and stored in the `scanners` registry for later use.
   *
   * @async
   * @returns {Promise<void>} Resolves once all active scanners are created and registered
   * @throws {Error} If scanner or extractor creation fails
   */
  protected createDataAdapters = async () => {
    try {
      // Create Ergo data-adapter
      this.adapters[NETWORKS.ergo.key] = this.createChainSpecificDataAdapter(
        NETWORKS.ergo.key,
        {
          explorerUrl: configs.chains.ergo.explorer.connections.at(0)!.url,
        },
      );

      if (
        configs.chains.cardano.active &&
        configs.chains.cardano.koios.connections.at(0)
      ) {
        // Create Cardano data-adapter
        const cardanoKoiosConnection: { [key: string]: string } = {
          koiosUrl: configs.chains.cardano.koios.connections.at(0)!.url,
        };
        if (configs.chains.cardano.koios.connections.at(0)!.authToken)
          cardanoKoiosConnection['authToken'] =
            configs.chains.cardano.koios.connections.at(0)!.authToken!;

        this.adapters[NETWORKS.cardano.key] =
          this.createChainSpecificDataAdapter(
            NETWORKS.cardano.key,
            cardanoKoiosConnection,
          );
      }

      if (
        configs.chains.bitcoin.active &&
        configs.chains.bitcoin.esplora.connections.at(0)
      ) {
        // Create Bitcoin data-adapter
        this.adapters[NETWORKS.bitcoin.key] =
          this.createChainSpecificDataAdapter(NETWORKS.bitcoin.key, {
            url: configs.chains.bitcoin.esplora.connections.at(0)!.url,
          });
      }

      if (configs.chains.doge.active) {
        // Create Doge data-adapter
        this.adapters[NETWORKS.doge.key] = this.createChainSpecificDataAdapter(
          NETWORKS.doge.key,
          {
            blockCypherUrl: configs.chains.doge.adapter.blockCypher.url,
          },
        );
      }

      if (
        configs.chains.ethereum.active &&
        configs.chains.ethereum.rpc.connections.at(0)
      ) {
        // Create Ethereum data-adapter
        this.adapters[NETWORKS.ethereum.key] =
          this.createChainSpecificDataAdapter(NETWORKS.ethereum.key, {
            url: configs.chains.ethereum.rpc.connections.at(0)!.url!,
          });
      }

      if (
        configs.chains.binance.active &&
        configs.chains.binance.rpc.connections.at(0)
      ) {
        // Create Binance data-adapter
        this.adapters[NETWORKS.binance.key] =
          this.createChainSpecificDataAdapter(NETWORKS.binance.key, {
            url: configs.chains.binance.rpc.connections.at(0)!.url!,
          });
      }
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
    if (this.instance != undefined) {
      return;
    }
    this.instance = new AssetDataAdapterService(logger);
  };

  /**
   * return the singleton instance of AssetDataAdapterService
   *
   * @static
   * @return {AssetDataAdapterService}
   * @memberof AssetDataAdapterService
   */
  static readonly getInstance = (): AssetDataAdapterService => {
    if (!this.instance) {
      throw new Error(
        'AssetDataAdapterService instances is not initialized yet',
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
    const assets = await this.getAssetsTotalSupply();
    this.redis.set('total_supply', JsonBigInt.stringify(assets));
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
        fn: async () => {
          this.redis.set(
            adapter.chain,
            JsonBigInt.stringify(await adapter.fetch()),
          );
        },
        interval:
          configs.chains[adapter.chain as keyof Chains].scanInterval * 1000,
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
