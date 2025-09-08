import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { WebSocketScanner, CardanoOgmiosScanner } from '@rosen-bridge/scanner';
import {
  PeriodicTaskService,
  Dependency,
  ServiceStatus,
} from '@rosen-bridge/service-manager';
import { NETWORKS } from '@rosen-ui/constants';

import { configs } from '../configs';
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
import { ChainScannersType, ChainsKeys } from '../types';
import { DBService } from './db';

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
      this.scanners[NETWORKS.ergo.key] = await initializeErgoScanner(
        this.dbService.dataSource,
      );

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
