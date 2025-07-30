import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';
import { ErgoObservationExtractor } from '@rosen-bridge/observation-extractor';
import * as scanner from '@rosen-bridge/scanner';
import { ErgoNetworkType, Transaction } from '@rosen-bridge/scanner-interfaces';
import {
  AbstractService,
  Dependency,
  ServiceStatus,
} from '@rosen-bridge/service-manager';
import { EventTriggerExtractor } from '@rosen-bridge/watcher-data-extractor';

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
    try {
      const rosenServiceExtractor = new ErgoObservationExtractor(
        this.dbService.dataSource,
        await getTokenMap(),
        configs.contracts.ergo.addresses.lock,
        this.logger,
      );
      await this.scanner.registerExtractor(rosenServiceExtractor);
      const ergoEventTriggerExtractor = new EventTriggerExtractor(
        'ergo-extractor',
        this.dbService.dataSource,
        ErgoNetworkType.Node,
        configs.chains.ergo.node.url,
        configs.contracts.ergo.addresses.WatcherTriggerEvent,
        configs.contracts.ergo.tokens.RWTId,
        configs.contracts.ergo.addresses.WatcherPermit,
        configs.contracts.ergo.addresses.Fraud,
        CallbackLoggerFactory.getInstance().getLogger(
          'ergo-event-trigger-extractor',
        ),
      );
      await this.scanner.registerExtractor(ergoEventTriggerExtractor);
      if (configs.chains.cardano.active) {
        const cardanoEventTriggerExtractor = new EventTriggerExtractor(
          'cardano-extractor',
          this.dbService.dataSource,
          ErgoNetworkType.Node,
          configs.chains.ergo.node.url,
          configs.contracts.cardano.addresses.WatcherTriggerEvent,
          configs.contracts.cardano.tokens.RWTId,
          configs.contracts.cardano.addresses.WatcherPermit,
          configs.contracts.cardano.addresses.Fraud,
          CallbackLoggerFactory.getInstance().getLogger(
            'cardano-event-trigger-extractor',
          ),
        );
        await this.scanner.registerExtractor(cardanoEventTriggerExtractor);
      }
      if (configs.chains.bitcoin.active) {
        const bitcoinEventTriggerExtractor = new EventTriggerExtractor(
          'bitcoin-extractor',
          this.dbService.dataSource,
          ErgoNetworkType.Node,
          configs.chains.ergo.node.url,
          configs.contracts.bitcoin.addresses.WatcherTriggerEvent,
          configs.contracts.bitcoin.tokens.RWTId,
          configs.contracts.bitcoin.addresses.WatcherPermit,
          configs.contracts.bitcoin.addresses.Fraud,
          CallbackLoggerFactory.getInstance().getLogger(
            'bitcoin-event-trigger-extractor',
          ),
        );
        await this.scanner.registerExtractor(bitcoinEventTriggerExtractor);
      }
      if (configs.chains.doge.active) {
        const dogeEventTriggerExtractor = new EventTriggerExtractor(
          'doge-extractor',
          this.dbService.dataSource,
          ErgoNetworkType.Node,
          configs.chains.ergo.node.url,
          configs.contracts.doge.addresses.WatcherTriggerEvent,
          configs.contracts.doge.tokens.RWTId,
          configs.contracts.doge.addresses.WatcherPermit,
          configs.contracts.doge.addresses.Fraud,
          CallbackLoggerFactory.getInstance().getLogger(
            'doge-event-trigger-extractor',
          ),
        );
        await this.scanner.registerExtractor(dogeEventTriggerExtractor);
      }
      if (configs.chains.ethereum.active) {
        const ethereumEventTriggerExtractor = new EventTriggerExtractor(
          'ethereum-extractor',
          this.dbService.dataSource,
          ErgoNetworkType.Node,
          configs.chains.ergo.node.url,
          configs.contracts.ethereum.addresses.WatcherTriggerEvent,
          configs.contracts.ethereum.tokens.RWTId,
          configs.contracts.ethereum.addresses.WatcherPermit,
          configs.contracts.ethereum.addresses.Fraud,
          CallbackLoggerFactory.getInstance().getLogger(
            'ethereum-event-trigger-extractor',
          ),
        );
        await this.scanner.registerExtractor(ethereumEventTriggerExtractor);
      }
      if (configs.chains.binance.active) {
        const binanceEventTriggerExtractor = new EventTriggerExtractor(
          'binance-extractor',
          this.dbService.dataSource,
          ErgoNetworkType.Node,
          configs.chains.ergo.node.url,
          configs.contracts.binance.addresses.WatcherTriggerEvent,
          configs.contracts.binance.tokens.RWTId,
          configs.contracts.binance.addresses.WatcherPermit,
          configs.contracts.binance.addresses.Fraud,
          CallbackLoggerFactory.getInstance().getLogger(
            'binance-event-trigger-extractor',
          ),
        );
        await this.scanner.registerExtractor(binanceEventTriggerExtractor);
      }
    } catch (error) {
      throw new Error(
        `cannot create or register event trigger extractors due to error: ${error}`,
      );
    }
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
