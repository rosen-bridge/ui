import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { ScannerSyncHealthCheckParam } from '@rosen-bridge/scanner-sync-check';
import {
  AbstractService,
  Dependency,
  ServiceStatus,
} from '@rosen-bridge/service-manager';
import { NETWORKS } from '@rosen-ui/constants';

import { configs } from '../configs';
import {
  BINANCE_BLOCK_TIME,
  BITCOIN_BLOCK_TIME,
  DOGE_BLOCK_TIME,
  ETHEREUM_BLOCK_TIME,
} from '../constants';
import { CARDANO_BLOCK_TIME } from '../constants';
import { ChainsScannerService } from './chainsScanners';
import { DBService } from './db';
import { HealthService } from './healthCheck';

export class ChainsHealthCheckService extends AbstractService {
  name = 'ChainsHealthCheckService';
  private static instance: ChainsHealthCheckService;
  protected dbService: DBService;
  protected healthCheckService: HealthService;
  protected chainsScannerService: ChainsScannerService;
  protected chainsHealthParams: ScannerSyncHealthCheckParam[] = [];
  protected dependencies: Dependency[] = [
    {
      serviceName: DBService.name,
      allowedStatuses: [ServiceStatus.running],
    },
    {
      serviceName: HealthService.name,
      allowedStatuses: [ServiceStatus.started, ServiceStatus.running],
    },
    {
      serviceName: ChainsScannerService.name,
      allowedStatuses: [ServiceStatus.running],
    },
  ];

  private constructor(logger?: AbstractLogger) {
    super(logger);

    this.dbService = DBService.getInstance();
    this.healthCheckService = HealthService.getInstance();
    this.chainsScannerService = ChainsScannerService.getInstance();

    this.makeParams();
  }

  /**
   * builds and stores health check parameters for active chains
   *
   * @returns {void}
   */
  protected makeParams = () => {
    if (configs.chains.cardano.active) {
      this.chainsHealthParams.push(
        new ScannerSyncHealthCheckParam(
          NETWORKS.cardano.key,
          async () =>
            this.dbService.getLastSavedBlock(
              this.chainsScannerService
                .getScanners()
                [NETWORKS.cardano.key]!.name(),
            ),
          configs.healthCheck.scanner.warnDiff,
          configs.healthCheck.scanner.criticalDiff,
          CARDANO_BLOCK_TIME * 1000,
        ),
      );
    }
    if (configs.chains.bitcoin.active) {
      this.chainsHealthParams.push(
        new ScannerSyncHealthCheckParam(
          NETWORKS.bitcoin.key,
          async () =>
            this.dbService.getLastSavedBlock(
              this.chainsScannerService
                .getScanners()
                [NETWORKS.bitcoin.key]!.name(),
            ),
          configs.healthCheck.scanner.warnDiff,
          configs.healthCheck.scanner.criticalDiff,
          BITCOIN_BLOCK_TIME * 1000,
        ),
      );
    }
    if (configs.chains.doge.active) {
      this.chainsHealthParams.push(
        new ScannerSyncHealthCheckParam(
          NETWORKS.doge.key,
          async () =>
            this.dbService.getLastSavedBlock(
              this.chainsScannerService
                .getScanners()
                [NETWORKS.doge.key]!.name(),
            ),
          configs.healthCheck.scanner.warnDiff,
          configs.healthCheck.scanner.criticalDiff,
          DOGE_BLOCK_TIME * 1000,
        ),
      );
    }
    if (configs.chains.ethereum.active) {
      this.chainsHealthParams.push(
        new ScannerSyncHealthCheckParam(
          NETWORKS.ethereum.key,
          async () =>
            this.dbService.getLastSavedBlock(
              this.chainsScannerService
                .getScanners()
                [NETWORKS.ethereum.key]!.name(),
            ),
          configs.healthCheck.scanner.warnDiff,
          configs.healthCheck.scanner.criticalDiff,
          ETHEREUM_BLOCK_TIME * 1000,
        ),
      );
    }
    if (configs.chains.binance.active) {
      this.chainsHealthParams.push(
        new ScannerSyncHealthCheckParam(
          NETWORKS.binance.key,
          async () =>
            this.dbService.getLastSavedBlock(
              this.chainsScannerService
                .getScanners()
                [NETWORKS.binance.key]!.name(),
            ),
          configs.healthCheck.scanner.warnDiff,
          configs.healthCheck.scanner.criticalDiff,
          BINANCE_BLOCK_TIME * 1000,
        ),
      );
    }
  };

  /**
   * initializes the singleton instance of ChainsHealthCheckService
   *
   * @static
   * @param {DataSource} dataSource
   * @param {AbstractLogger} [logger]
   * @memberof ChainsHealthCheckService
   */
  static init = (logger?: AbstractLogger) => {
    if (this.instance != undefined) {
      return;
    }
    this.instance = new ChainsHealthCheckService(logger);
  };

  /**
   * return the singleton instance of ChainsHealthCheckService
   *
   * @static
   * @return {ChainsHealthCheckService}
   * @memberof ChainsHealthCheckService
   */
  static getInstance = (): ChainsHealthCheckService => {
    if (!this.instance) {
      throw new Error(`${this.name} instances is not initialized yet`);
    }
    return this.instance;
  };

  /**
   * registers all prepared health check parameters
   * and sets service status to running
   *
   * @returns {Promise<boolean>} true if started successfully, false otherwise
   */
  protected start = async (): Promise<boolean> => {
    try {
      for (const param of this.chainsHealthParams) {
        this.healthCheckService.registerHealthParam(param);
      }
      this.setStatus(ServiceStatus.running);
    } catch (e) {
      this.logger.error(
        `Something went wrong while starting the ChainsHealthCheckService: ${e}`,
      );
      return false;
    }
    return true;
  };

  /**
   * unregisters all health check parameters
   * and sets service status to dormant
   *
   * @returns {Promise<boolean>} always true after stop
   */
  protected stop = async (): Promise<boolean> => {
    for (const param of this.chainsHealthParams)
      this.healthCheckService.unregisterHealthParam(param.getId());

    this.setStatus(ServiceStatus.dormant);

    return true;
  };
}
