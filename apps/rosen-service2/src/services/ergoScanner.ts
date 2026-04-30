import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import {
  FailoverStrategy,
  NetworkConnectorManager,
} from '@rosen-bridge/abstract-scanner';
import {
  ErgoExplorerNetwork,
  ErgoNodeNetwork,
  ErgoScanner,
} from '@rosen-bridge/ergo-scanner';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { Transaction } from '@rosen-bridge/scanner-interfaces';
import {
  Dependency,
  ServiceAction,
  ServiceStatus,
  Task,
} from '@rosen-bridge/service-manager';
import 'constants';

import { configs } from '../configs';
import { ERGO_METHOD_EXPLORER } from '../constants';
import { AbstractErgoExtractorsService } from './types/abstractErgoExtractor';
import { AbstractErgoScannerService } from './types/abstractErgoScanner';
import { AbstractTokenMapService } from './types/abstractTokenMapService';
import { AbstractDBService } from './types/abstrctDb';

export class ErgoScannerService extends AbstractErgoScannerService {
  name = 'ErgoScannerService';
  ergoScanner: ErgoScanner;
  protected dependencies: Dependency[] = [
    {
      serviceName: AbstractDBService.getInstance().getName(),
      allowedStatuses: [ServiceStatus.running, ServiceStatus.dormant],
      action: ServiceAction.assemble,
    },
    {
      serviceName: AbstractErgoExtractorsService.Name,
      allowedStatuses: [ServiceStatus.running],
      action: ServiceAction.start,
    },
    {
      serviceName: AbstractTokenMapService.Name,
      allowedStatuses: [ServiceStatus.running],
      action: ServiceAction.start,
    },
  ];

  protected postStop = async () => {};

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

  assemble = async (): Promise<boolean> => {
    try {
      this.ergoScanner = this.createErgoScanner(
        AbstractDBService.getInstance().getDataSource(),
      );
      this.setStatus(ServiceStatus.dormant);

      return true;
    } catch {
      return false;
    }
  };

  /**
   * Creates a new ErgoScannerService instance.
   *
   * @param {DataSource} dataSource Database data source used by the scanner.
   * @param {AbstractLogger} [logger=new DummyLogger()] Optional logger instance.
   */
  constructor(logger: AbstractLogger = new DummyLogger()) {
    super(logger);
  }

  /**
   * Initializes the singleton instance of the service.
   *
   * @param {DataSource} dataSource Database data source.
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
      this.logger.child('ergoScannerLogger'),
    );
    if (configs.chains.ergo.method == ERGO_METHOD_EXPLORER) {
      configs.chains.ergo.explorer.connections.forEach((explorer) => {
        networkConnectorManager.addConnector(
          new ErgoExplorerNetwork(explorer.url!),
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
      logger: this.logger.child('ergoScannerLogger'),
    });
  };
}
