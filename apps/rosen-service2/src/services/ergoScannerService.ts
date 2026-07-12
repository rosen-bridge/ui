import {
  type AbstractLogger,
  DummyLogger,
} from '@rosen-bridge/abstract-logger';
import {
  FailoverStrategy,
  NetworkConnectorManager,
} from '@rosen-bridge/abstract-scanner';
import {
  ErgoExplorerNetwork,
  ErgoNodeNetwork,
  ErgoScanner,
} from '@rosen-bridge/ergo-scanner';
import type { DataSource } from '@rosen-bridge/extended-typeorm';
import type { Transaction } from '@rosen-bridge/scanner-interfaces';
import {
  type Dependency,
  ServiceAction,
  ServiceStatus,
  type Task,
} from '@rosen-bridge/service-manager';

import { configs } from '../configs';
import { ERGO_METHOD_EXPLORER } from '../constants';
import {
  AbstractDBService,
  AbstractErgoExtractorsService,
  AbstractErgoScannerService,
  AbstractTokenMapService,
} from './abstracts';

export class ErgoScannerService extends AbstractErgoScannerService {
  static serviceName = AbstractErgoScannerService.name;
  ergoScanner: ErgoScanner;
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
      serviceName: AbstractErgoExtractorsService.name,
      allowedStatuses: [ServiceStatus.running],
      action: ServiceAction.start,
    },
    {
      serviceName: AbstractTokenMapService.name,
      allowedStatuses: [ServiceStatus.running],
      action: ServiceAction.start,
    },
  ];

  /**
   * Stops Ergo scanner
   *
   * @returns void
   */
  protected postStop = async () => {};

  /**
   * Starts Ergo scanner
   *
   * @returns void
   */
  protected preStart = async () => {};

  /**
   * Runs the scanner update function at configured intervals.
   * @returns {Task[]} Array of scheduled tasks.
   */
  protected getTasks = (): Task[] => {
    return [
      {
        fn: this.ergoScanner.update,
        interval: configs.chains.ergo.scanInterval,
      },
    ];
  };

  /**
   * Assembles the service by initializing dependencies
   * @async
   * @returns {Promise<boolean>} Resolves to `true` when the assembly is successfully completed.
   */
  protected assemble = async (): Promise<boolean> => {
    this.ergoScanner = this.createErgoScanner(
      AbstractDBService.getInstance().getDataSource(),
    );
    this.setStatus(ServiceStatus.dormant);
    return true;
  };

  /**
   * Creates a new ErgoScannerService instance.
   *
   * @param {AbstractLogger} [logger=new DummyLogger()] Optional logger instance.
   */
  protected constructor(logger: AbstractLogger = new DummyLogger()) {
    super(logger);
  }

  /**
   * Initializes the singleton instance of the service.
   *
   * @param {AbstractLogger} [logger] Optional logger instance.
   */
  static init = async (logger?: AbstractLogger): Promise<void> => {
    if (AbstractErgoScannerService.instance != undefined) {
      return;
    }
    AbstractErgoScannerService.instance = new ErgoScannerService(logger);
  };

  /**
   * Returns the underlying ErgoScanner instance.
   * @returns {ErgoScanner} The scanner instance.
   */
  getErgoScanner = (): ErgoScanner => {
    return this.ergoScanner;
  };

  /**
   * Creates and configures an ErgoScanner instance.
   * Sets up a  NetworkConnectorManager with a failover strategy and
   * registers either explorer or node connectors based on configuration.
   * @param {DataSource} dataSource Database data source.
   * @returns {ErgoScanner} Configured Ergo scanner instance.
   */
  private createErgoScanner = (dataSource: DataSource): ErgoScanner => {
    const networkConnectorManager = new NetworkConnectorManager<Transaction>(
      new FailoverStrategy(),
      this.logger.child('networkConnectorManager'),
    );
    if (configs.chains.ergo.method == ERGO_METHOD_EXPLORER) {
      configs.chains.ergo.explorer.connections.forEach((explorer) => {
        networkConnectorManager.addConnector(
          new ErgoExplorerNetwork(explorer.url),
        );
      });
    } else {
      configs.chains.ergo.node.connections.forEach((node) => {
        networkConnectorManager.addConnector(new ErgoNodeNetwork(node.url!));
      });
    }
    return new ErgoScanner({
      dataSource: dataSource,
      initialHeight: configs.chains.ergo.initialHeight,
      network: networkConnectorManager,
      blockRetrieveGap: configs.chains.ergo.blockRetrieveGap,
      logger: this.logger.child('ergoScanner'),
    });
  };
}
