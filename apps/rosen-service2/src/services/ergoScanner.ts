import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';
import { ErgoObservationExtractor } from '@rosen-bridge/observation-extractor';
import * as scanner from '@rosen-bridge/scanner';
import { Transaction } from '@rosen-bridge/scanner-interfaces';
import {
  AbstractService,
  Dependency,
  ServiceStatus,
} from '@rosen-bridge/service-manager';

import { configs } from '../configs';
import { getTokenMap } from '../utils';
import { DBService } from './db';

export class ErgoScannerService extends AbstractService {
  name = 'ErgoScannerService';
  private static instance: ErgoScannerService;
  readonly dbService: DBService;
  private shouldStop = false;
  private latestTimeOut: undefined | ReturnType<typeof setTimeout>;
  private continueStop = () => {
    return;
  };
  protected dependencies: Dependency[] = [
    {
      serviceName: DBService.name,
      allowedStatuses: [ServiceStatus.running],
    },
  ];
  readonly scanner: scanner.ErgoScanner;

  private constructor(
    dbService: DBService,
    logger: AbstractLogger = new DummyLogger(),
  ) {
    super(logger);
    this.dbService = dbService;
    const networkConnectorManager =
      new scanner.NetworkConnectorManager<Transaction>(
        new scanner.FailoverStrategy(),
        this.logger,
      );
    networkConnectorManager.addConnector(
      new scanner.ErgoNodeNetwork(configs.chains.ergo.node.url),
    );
    this.scanner = new scanner.ErgoScanner({
      dataSource: this.dbService.dataSource,
      initialHeight: configs.chains.ergo.initialHeight,
      network: networkConnectorManager,
      blockRetrieveGap: configs.chains.ergo.node.blockRetrieveGap,
      logger: this.logger,
    });
  }

  /**
   * register all required extractors.
   *
   * @returns
   */
  protected readonly registerExtractors = async () => {
    const rosenServiceExtractor = new ErgoObservationExtractor(
      this.dbService.dataSource,
      await getTokenMap(),
      configs.contracts.ergo.addresses.lock,
      this.logger,
    );
    await this.scanner.registerExtractor(rosenServiceExtractor);
  };

  /**
   * initializes the singleton instance of ErgoScannerService
   *
   * @static
   * @param {Ergo} ErgoScannerConfig
   * @param {DBService} [dbService]
   * @memberof ErgoScannerService
   */
  static readonly init = async (dbService: DBService) => {
    if (this.instance != undefined) {
      return;
    }
    const logger = CallbackLoggerFactory.getInstance().getLogger(
      import.meta.url,
    );
    this.instance = new ErgoScannerService(dbService, logger);

    await this.instance.registerExtractors();
  };

  /**
   * return the singleton instance of ErgoScannerService
   *
   * @static
   * @return {ErgoScannerService}
   * @memberof ErgoScannerService
   */
  static readonly getInstance = (): ErgoScannerService => {
    if (!this.instance) {
      throw new Error('ErgoScannerService instances is not initialized yet');
    }
    return this.instance;
  };

  /**
   * starts the service. following steps are performed:
   *  - scanner update job is started
   *  - initiating fetch of boxes linked to ErgoObservationExtractor
   *
   * @protected
   * @return {Promise<boolean>} true if service started successfully, otherwise
   * false
   * @memberof ErgoScannerService
   */
  protected start = async (): Promise<boolean> => {
    this.shouldStop = false;
    this.setStatus(ServiceStatus.started);
    return await this.fetchData();
  };

  /**
   * Scan and fetch ErgoObservationExtractor boxes data
   * @returns {boolean}
   */
  protected fetchData = async () => {
    this.latestTimeOut = undefined;
    this.logger.info('Starting scanner fetchData job');
    try {
      await this.scanner.update();
    } catch (err) {
      this.logger.error(`ErgoScannerService fetchData failed: ${err}`);
      if (err instanceof Error && err.stack) this.logger.error(err.stack);
      return false;
    }

    const scheduled = setTimeout(
      () => this.fetchData(),
      configs.chains.ergo.node.rescanDelaySeconds * 1000,
    );

    if (this.shouldStop) {
      this.shouldStop = false;
      clearTimeout(scheduled);
      this.continueStop();
    } else {
      this.latestTimeOut = scheduled;
    }

    return true;
  };

  /**
   * stops the service. following steps are performed:
   *  - scheduled timeout are stopped
   *  - service's status is set to dormant
   *
   * @protected
   * @return {Promise<boolean>} true if service stopped successfully
   * @memberof ErgoScannerService
   */
  protected stop = async (): Promise<boolean> => {
    clearTimeout(this.latestTimeOut);
    await new Promise<void>((resolve) => {
      this.continueStop = resolve;
      this.shouldStop = true;
    });

    this.setStatus(ServiceStatus.dormant);
    return true;
  };
}
