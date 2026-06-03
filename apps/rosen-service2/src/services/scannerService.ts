import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { WebSocketScanner } from '@rosen-bridge/abstract-scanner';
import { CardanoOgmiosScanner } from '@rosen-bridge/cardano-scanner';
import { TokenMap } from '@rosen-bridge/extended-tokens';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import {
  Dependency,
  ServiceStatus,
  ServiceAction,
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
import { ChainScannersType, ChainsKeys, ChainsWithScanner } from '../types';
import {
  AbstractErgoScannerService,
  AbstractScannerService,
  AbstractTokenMapService,
  AbstractDBService,
} from './abstracts';

export class ScannerService extends AbstractScannerService {
  name = AbstractScannerService.name;
  protected scanners: { [k1 in ChainsKeys]?: ChainScannersType } = {};
  private dataSource: DataSource;
  private tokenMap: TokenMap;
  protected dependencies: Dependency[] = [
    {
      serviceName: AbstractDBService.name,
      allowedStatuses: [
        ServiceStatus.running,
        ServiceStatus.started,
        ServiceStatus.dormant,
      ],
      action: ServiceAction.assemble,
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
      serviceName: AbstractErgoScannerService.name,
      allowedStatuses: [ServiceStatus.running],
      action: ServiceAction.start,
    },
  ];

  protected assemble = async (): Promise<boolean> => {
    this.dataSource = AbstractDBService.getInstance().getDataSource();
    this.tokenMap = AbstractTokenMapService.getInstance().getTokenMap();
    this.setStatus(ServiceStatus.dormant);
    return true;
  };

  protected constructor(logger?: AbstractLogger) {
    super(logger);
  }

  /**
   * Returns scanner instance for the given chain.
   *
   * @param {ChainsKeys} chain - Target chain key
   * @returns {ExtraChainScannersType | undefined} Scanner instance for the chain
   */
  public getScanner = (chain: ChainsKeys) => {
    this.scanners.ergo =
      AbstractErgoScannerService.getInstance().getErgoScanner();
    return this.scanners[chain];
  };

  /**
   * Generates and registers blockchain scanners along with their corresponding event extractors
   * based on the active chains and configured methods.
   *
   * Supported chains:
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
  protected generateAndRegisterScannersWithExtractors = async () => {
    try {
      if (configs.chains.cardano.active) {
        switch (configs.chains.cardano.method) {
          case CARDANO_METHOD_BLOCKFROST:
            this.scanners[NETWORKS.cardano.key] =
              await buildCardanoBlockFrostScannerWithExtractors(
                this.dataSource,
                this.tokenMap,
              );
            break;
          case CARDANO_METHOD_OGMIOS:
            this.scanners[NETWORKS.cardano.key] =
              await buildCardanoOgmiosScannerWithExtractors(
                this.dataSource,
                this.tokenMap,
              );
            break;
          case CARDANO_METHOD_KOIOS:
            this.scanners[NETWORKS.cardano.key] =
              await buildCardanoKoiosScannerWithExtractors(
                this.dataSource,
                this.tokenMap,
              );
            break;
        }
      }
      if (
        configs.chains.bitcoin.active ||
        configs.chains['bitcoin-runes'].active
      ) {
        switch (configs.chains.bitcoin.method) {
          case BITCOIN_METHOD_ESPLORA:
            this.scanners[NETWORKS.bitcoin.key] =
              await buildBitcoinEsploraScannerWithExtractors(
                this.dataSource,
                this.tokenMap,
              );
            break;
          case BITCOIN_METHOD_RPC:
            this.scanners[NETWORKS.bitcoin.key] =
              await buildBitcoinRpcScannerWithExtractors(
                this.dataSource,
                this.tokenMap,
              );
            break;
        }
      }
      if (configs.chains.doge.active) {
        switch (configs.chains.doge.method) {
          case DOGE_METHOD_ESPLORA:
            this.scanners[NETWORKS.doge.key] =
              await buildDogeEsploraScannerWithExtractors(
                this.dataSource,
                this.tokenMap,
              );
            break;
          case DOGE_METHOD_RPC:
            this.scanners[NETWORKS.doge.key] =
              await buildDogeRpcScannerWithExtractors(
                this.dataSource,
                this.tokenMap,
              );
            break;
        }
      }
      if (configs.chains.ethereum.active) {
        this.scanners[NETWORKS.ethereum.key] =
          await buildEthereumEvmScannerWithExtractors(
            this.dataSource,
            this.tokenMap,
          );
      }
      if (configs.chains.binance.active) {
        this.scanners[NETWORKS.binance.key] =
          await buildBinanceRpcScannerWithExtractors(
            this.dataSource,
            this.tokenMap,
          );
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
   * @param {AbstractLogger} [logger]
   * @memberof ScannerService
   */
  static readonly init = async (logger?: AbstractLogger) => {
    if (AbstractScannerService.instance != undefined) {
      return;
    }
    AbstractScannerService.instance = new ScannerService(logger);
  };

  /**
   * start scanners with extractors
   *
   * @returns void
   */
  protected preStart = async () => {
    await this.generateAndRegisterScannersWithExtractors();
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
        interval:
          configs.chains[chain as ChainsWithScanner].scanInterval * 1000,
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
