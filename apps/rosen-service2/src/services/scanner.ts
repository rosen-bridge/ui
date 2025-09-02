import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';
import { ErgoObservationExtractor } from '@rosen-bridge/observation-extractor';
import {
  ErgoScanner,
  WebSocketScanner,
  CardanoOgmiosScanner,
} from '@rosen-bridge/scanner';
import { ErgoNetworkType } from '@rosen-bridge/scanner-interfaces';
import {
  PeriodicTaskService,
  Dependency,
  ServiceStatus,
} from '@rosen-bridge/service-manager';
import { EventTriggerExtractor } from '@rosen-bridge/watcher-data-extractor';
import { NETWORKS } from '@rosen-ui/constants';

import { configs } from '../configs';
import { ERGO_METHOD_EXPLORER } from '../constants';
import {
  BITCOIN_METHOD_ESPLORA,
  BITCOIN_METHOD_RPC,
  CARDANO_METHOD_BLOCKFROST,
  CARDANO_METHOD_KOIOS,
  DOGE_METHOD_ESPLORA,
  DOGE_METHOD_RPC,
} from '../constants';
import { CARDANO_METHOD_OGMIOS } from '../constants';
import { initializeErgoScanner } from '../scanners';
import {
  buildCardanoKoiosScannerWithExtractors,
  buildBitcoinRpcScannerWithExtractors,
  buildDogeRpcScannerWithExtractors,
  buildEthereumEvmScannerWithExtractors,
  buildBinanceRpcScannerWithExtractors,
  buildBitcoinEsploraScannerWithExtractors,
  buildDogeEsploraScannerWithExtractors,
  buildCardanoBlockFrostScannerWithExtractors,
  buildCardanoOgmiosScannerWithExtractors,
} from '../scanners';
import { TokensConfig } from '../tokensConfig';
import { ChainScannersType } from '../types';
import { DBService } from './db';

type ChainsKeys = Exclude<keyof (typeof configs)['chains'], 'bitcoinRunes'>;

export class ScannerService extends PeriodicTaskService {
  name = 'ScannerService';
  taskName = 'ScannerService';
  private static instance: ScannerService;
  protected scanners: { [k1 in ChainsKeys]?: ChainScannersType } = {};
  readonly dbService: DBService;
  protected dependencies: Dependency[] = [
    {
      serviceName: DBService.name,
      allowedStatuses: [ServiceStatus.running],
    },
  ];

  private constructor(dbService: DBService, logger?: AbstractLogger) {
    super(logger);
    this.dbService = dbService;
  }

  /**
   * return scanners
   *
   * @returns { { [k1 in ChainsKeys]?: ExtraChainScannersType } } scanners
   */
  public getScanners = () => this.scanners;

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
   */ protected generateAndRegisterScannersWithExtractors = async () => {
    try {
      this.scanners[NETWORKS.ergo.key] = initializeErgoScanner(
        this.dbService.dataSource,
      );
      await this.registerErgoExtractors();

      if (configs.chains.cardano.active) {
        switch (configs.chains.cardano.method) {
          case CARDANO_METHOD_BLOCKFROST:
            this.scanners[NETWORKS.cardano.key] =
              await buildCardanoBlockFrostScannerWithExtractors(
                this.dbService.dataSource,
              );
            break;
          case CARDANO_METHOD_OGMIOS:
            this.scanners[NETWORKS.cardano.key] =
              await buildCardanoOgmiosScannerWithExtractors(
                this.dbService.dataSource,
              );
            break;
          case CARDANO_METHOD_KOIOS:
            this.scanners[NETWORKS.cardano.key] =
              await buildCardanoKoiosScannerWithExtractors(
                this.dbService.dataSource,
              );
            break;
        }
      }
      if (configs.chains.bitcoin.active) {
        switch (configs.chains.bitcoin.method) {
          case BITCOIN_METHOD_ESPLORA:
            this.scanners[NETWORKS.bitcoin.key] =
              await buildBitcoinEsploraScannerWithExtractors(
                this.dbService.dataSource,
              );
            break;
          case BITCOIN_METHOD_RPC:
            this.scanners[NETWORKS.bitcoin.key] =
              await buildBitcoinRpcScannerWithExtractors(
                this.dbService.dataSource,
              );
            break;
        }
      }
      if (configs.chains.doge.active) {
        switch (configs.chains.doge.method) {
          case DOGE_METHOD_ESPLORA:
            this.scanners[NETWORKS.doge.key] =
              await buildDogeEsploraScannerWithExtractors(
                this.dbService.dataSource,
              );
            break;
          case DOGE_METHOD_RPC:
            this.scanners[NETWORKS.doge.key] =
              await buildDogeRpcScannerWithExtractors(
                this.dbService.dataSource,
              );
            break;
        }
      }
      if (configs.chains.ethereum.active) {
        this.scanners[NETWORKS.ethereum.key] =
          await buildEthereumEvmScannerWithExtractors(
            this.dbService.dataSource,
          );
      }
      if (configs.chains.binance.active) {
        this.scanners[NETWORKS.binance.key] =
          await buildBinanceRpcScannerWithExtractors(this.dbService.dataSource);
      }
    } catch (error) {
      throw new Error(
        `cannot create or register event trigger extractors due to error: ${error}`,
      );
    }
  };

  /**
   * register all required extractors.
   *
   * @returns
   */
  protected readonly registerErgoExtractors = async () => {
    try {
      const scanner = this.scanners[NETWORKS.ergo.key]! as ErgoScanner;
      let networkType: ErgoNetworkType;
      let url: string;
      if (configs.chains.ergo.method == ERGO_METHOD_EXPLORER) {
        networkType = ErgoNetworkType.Explorer;
        url = configs.chains.ergo.explorer.url!;
      } else {
        networkType = ErgoNetworkType.Node;
        url = configs.chains.ergo.node.url!;
      }

      const ergoObservationExtractor = new ErgoObservationExtractor(
        this.dbService.dataSource,
        TokensConfig.getInstance().getTokenMap(),
        configs.contracts.ergo.addresses.lock,
        this.logger,
      );
      await scanner.registerExtractor(ergoObservationExtractor);
      const ergoEventTriggerExtractor = new EventTriggerExtractor(
        'ergo-extractor',
        this.dbService.dataSource,
        networkType,
        url,
        configs.contracts.ergo.addresses.WatcherTriggerEvent,
        configs.contracts.ergo.tokens.RWTId,
        configs.contracts.ergo.addresses.WatcherPermit,
        configs.contracts.ergo.addresses.Fraud,
        CallbackLoggerFactory.getInstance().getLogger(
          'ergo-event-trigger-extractor',
        ),
      );
      await scanner.registerExtractor(ergoEventTriggerExtractor);
      if (configs.chains.cardano.active) {
        const cardanoEventTriggerExtractor = new EventTriggerExtractor(
          'cardano-extractor',
          this.dbService.dataSource,
          networkType,
          url,
          configs.contracts.cardano.addresses.WatcherTriggerEvent,
          configs.contracts.cardano.tokens.RWTId,
          configs.contracts.cardano.addresses.WatcherPermit,
          configs.contracts.cardano.addresses.Fraud,
          CallbackLoggerFactory.getInstance().getLogger(
            'cardano-event-trigger-extractor',
          ),
        );
        await scanner.registerExtractor(cardanoEventTriggerExtractor);
      }
      if (configs.chains.bitcoin.active) {
        const bitcoinEventTriggerExtractor = new EventTriggerExtractor(
          'bitcoin-extractor',
          this.dbService.dataSource,
          networkType,
          url,
          configs.contracts.bitcoin.addresses.WatcherTriggerEvent,
          configs.contracts.bitcoin.tokens.RWTId,
          configs.contracts.bitcoin.addresses.WatcherPermit,
          configs.contracts.bitcoin.addresses.Fraud,
          CallbackLoggerFactory.getInstance().getLogger(
            'bitcoin-event-trigger-extractor',
          ),
        );
        await scanner.registerExtractor(bitcoinEventTriggerExtractor);
      }
      if (configs.chains.doge.active) {
        const dogeEventTriggerExtractor = new EventTriggerExtractor(
          'doge-extractor',
          this.dbService.dataSource,
          networkType,
          url,
          configs.contracts.doge.addresses.WatcherTriggerEvent,
          configs.contracts.doge.tokens.RWTId,
          configs.contracts.doge.addresses.WatcherPermit,
          configs.contracts.doge.addresses.Fraud,
          CallbackLoggerFactory.getInstance().getLogger(
            'doge-event-trigger-extractor',
          ),
        );
        await scanner.registerExtractor(dogeEventTriggerExtractor);
      }
      if (configs.chains.ethereum.active) {
        const ethereumEventTriggerExtractor = new EventTriggerExtractor(
          'ethereum-extractor',
          this.dbService.dataSource,
          networkType,
          url,
          configs.contracts.ethereum.addresses.WatcherTriggerEvent,
          configs.contracts.ethereum.tokens.RWTId,
          configs.contracts.ethereum.addresses.WatcherPermit,
          configs.contracts.ethereum.addresses.Fraud,
          CallbackLoggerFactory.getInstance().getLogger(
            'ethereum-event-trigger-extractor',
          ),
        );
        await scanner.registerExtractor(ethereumEventTriggerExtractor);
      }
      if (configs.chains.binance.active) {
        const binanceEventTriggerExtractor = new EventTriggerExtractor(
          'binance-extractor',
          this.dbService.dataSource,
          networkType,
          url,
          configs.contracts.binance.addresses.WatcherTriggerEvent,
          configs.contracts.binance.tokens.RWTId,
          configs.contracts.binance.addresses.WatcherPermit,
          configs.contracts.binance.addresses.Fraud,
          CallbackLoggerFactory.getInstance().getLogger(
            'binance-event-trigger-extractor',
          ),
        );
        await scanner.registerExtractor(binanceEventTriggerExtractor);
      }
    } catch (error) {
      throw new Error(
        `cannot create or register event trigger extractors due to error: ${error}`,
      );
    }
  };

  /**
   * initializes the singleton instance of ScannerService
   *
   * @static
   * @param {DBService} [dbService]
   * @param {AbstractLogger} [logger]
   * @memberof ScannerService
   */
  static readonly init = async (logger?: AbstractLogger) => {
    if (this.instance != undefined) {
      return;
    }
    this.instance = new ScannerService(DBService.getInstance(), logger);

    await this.instance.generateAndRegisterScannersWithExtractors();
  };

  /**
   * return the singleton instance of ScannerService
   *
   * @static
   * @return {ScannerService}
   * @memberof ScannerService
   */
  static readonly getInstance = (): ScannerService => {
    if (!this.instance) {
      throw new Error('ScannerService instances is not initialized yet');
    }
    return this.instance;
  };

  /**
   * start scanners with extractors
   *
   * @returns void
   */
  protected preStart = async () => {
    for (const [, scanner] of Object.entries(this.scanners)) {
      if (scanner instanceof WebSocketScanner) {
        if (!scanner.getConnectionStatus()) {
          try {
            scanner.start();
          } catch (err) {
            this.logger.error(
              `ScannerService websocket scanners start failed: ${err}`,
            );
            if (err instanceof Error && err.stack) {
              this.logger.debug(err.stack);
            }
          }
        }
      }
    }
    this.setStatus(ServiceStatus.started);
  };

  /**
   * Builds a list of asynchronous tasks for all chains scanners.
   *
   * @returns {Task[]}
   */
  protected getTasks = () => {
    const tasks = [];
    for (const [chain, scanner] of Object.entries(this.scanners)) {
      tasks.push({
        fn: async () => {
          try {
            if (!(scanner instanceof WebSocketScanner)) {
              await scanner.update();
            }
          } catch (err) {
            this.logger.error(
              `ScannerService ${chain} scanner update failed: ${err}`,
            );
            if (err instanceof Error && err.stack) {
              this.logger.debug(err.stack);
            }
          }
        },
        interval: configs.chains[chain as ChainsKeys].scanInterval * 1000,
      });
    }
    return tasks;
  };

  /**
   * Performs necessary cleanup after stopping the service,
   * including stopping connected CardanoOgmiosScanners.
   *
   * @returns void
   */
  protected postStop = async () => {
    Object.values(this.scanners).map(async (scanner) => {
      if (scanner instanceof CardanoOgmiosScanner) {
        if (scanner.getConnectionStatus()) {
          try {
            await scanner.stop();
          } catch (err) {
            this.logger.error(
              `ScannerService websocket scanners stop failed: ${err}`,
            );
            if (err instanceof Error && err.stack) {
              this.logger.debug(err.stack);
            }
          }
        }
      }
    });

    this.logger.info('The ScannerService stopped');
  };
}
