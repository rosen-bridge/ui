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
import {
  getDogeScanner,
  getCardanoScanner,
  getBitcoinScanner,
  getBinanceScanner,
  getEthereumScanner,
} from 'scanners';

import { configs } from '../configs';
import {
  ChainChoices,
  ChainScannersType,
  ChainsKeys,
  ChainsWithScanner,
} from '../types';
import {
  AbstractErgoScannerService,
  AbstractScannerService,
  AbstractTokenMapService,
  AbstractDBService,
} from './abstracts';

export class ScannerService extends AbstractScannerService {
  static serviceName = AbstractScannerService.name;
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

  /**
   * Assembles the service by initializing dependencies
   * @async
   * @returns {Promise<boolean>} Resolves to `true` when the assembly is successfully completed.
   */
  protected assemble = async (): Promise<boolean> => {
    this.dataSource = AbstractDBService.getInstance().getDataSource();
    this.tokenMap = AbstractTokenMapService.getInstance().getTokenMap();
    await this.generateAndRegisterScannersWithExtractors();
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
   * Returns scanner instance for the given chain.
   *
   * @param {ChainsKeys} chain - Target chain key
   * @returns {ChainScannersType | undefined} Scanner instance for the chain
   */
  public getScanner = (chain: ChainsKeys) => {
    if (chain === NETWORKS.ergo.key) {
      return AbstractErgoScannerService.getInstance().getErgoScanner();
    } else {
      return this.scanners[chain];
    }
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
      const chains = Object.keys(configs.chains) as ChainChoices[];

      for (const chain of chains) {
        console.log(chain);
        switch (chain) {
          case NETWORKS.binance.key:
            if (configs.chains.binance.active) {
              this.scanners[NETWORKS.binance.key] = await getBinanceScanner(
                this.dataSource,
                this.tokenMap,
              );
            }
            break;
          case NETWORKS.ethereum.key:
            if (configs.chains.ethereum.active) {
              this.scanners[NETWORKS.ethereum.key] = await getEthereumScanner(
                this.dataSource,
                this.tokenMap,
              );
            }
            break;
          case NETWORKS.cardano.key:
            if (configs.chains.cardano.active) {
              this.scanners[NETWORKS.cardano.key] = await getCardanoScanner(
                this.dataSource,
                this.tokenMap,
              );
            }
            break;
          case NETWORKS.bitcoin.key:
            if (
              configs.chains.bitcoin.active ||
              configs.chains['bitcoin-runes'].active
            ) {
              this.scanners[NETWORKS.bitcoin.key] = await getBitcoinScanner(
                this.dataSource,
                this.tokenMap,
              );
            }
            break;
          case NETWORKS.doge.key:
            if (configs.chains.doge.active) {
              this.scanners[NETWORKS.doge.key] = await getDogeScanner(
                this.dataSource,
                this.tokenMap,
              );
            }
            break;
        }
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
    for (const [, scanner] of Object.entries(this.scanners)) {
      if (scanner instanceof WebSocketScanner) {
        if (!scanner.getConnectionStatus()) {
          scanner.start();
        }
      }
    }
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
          if (!(scanner instanceof WebSocketScanner)) {
            await scanner.update();
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
          await scanner.stop();
        }
      }
    });
  };
}
