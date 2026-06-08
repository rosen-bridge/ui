import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { ErgoObservationExtractor } from '@rosen-bridge/ergo-observation-extractor';
import { ErgoScanner } from '@rosen-bridge/ergo-scanner';
import { TokenMap } from '@rosen-bridge/extended-tokens';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import {
  Dependency,
  ServiceAction,
  ServiceStatus,
} from '@rosen-bridge/service-manager';
import { EventTriggerExtractor } from '@rosen-bridge/watcher-data-extractor';
import { NETWORKS } from '@rosen-ui/constants';

import { configs } from '../configs';
import { ChainChoices, ChainConfigs } from '../types';
import { createEventTrigger, resolveErgoNetworkConfig } from '../utils';
import {
  AbstractErgoExtractorsService,
  AbstractErgoScannerService,
  AbstractTokenMapService,
  AbstractDBService,
} from './abstracts';

export class ErgoExtractorService extends AbstractErgoExtractorsService {
  private ergoScanner: ErgoScanner;
  name = AbstractErgoExtractorsService.name;
  private tokenMap: TokenMap;
  private extractors: (EventTriggerExtractor | ErgoObservationExtractor)[] = [];
  private dataSource: DataSource;
  protected dependencies: Dependency[] = [
    {
      serviceName: AbstractErgoScannerService.name,
      allowedStatuses: [
        ServiceStatus.started,
        ServiceStatus.running,
        ServiceStatus.dormant,
      ],
      action: ServiceAction.assemble,
    },
    {
      serviceName: AbstractTokenMapService.name,
      allowedStatuses: [
        ServiceStatus.started,
        ServiceStatus.running,
        ServiceStatus.dormant,
      ],
      action: ServiceAction.assemble,
    },
    {
      serviceName: AbstractDBService.name,
      allowedStatuses: [
        ServiceStatus.started,
        ServiceStatus.running,
        ServiceStatus.dormant,
      ],
      action: ServiceAction.assemble,
    },
  ];

  /**
   * Assembles the service by initializing dependencies
   * @async
   * @returns {Promise<boolean>} Resolves to `true` when the assembly is successfully completed.
   */
  protected assemble = async (): Promise<boolean> => {
    this.ergoScanner =
      AbstractErgoScannerService.getInstance().getErgoScanner();
    this.dataSource = AbstractDBService.getInstance().getDataSource();
    this.tokenMap = AbstractTokenMapService.getInstance().getTokenMap();
    const { networkType, url } = resolveErgoNetworkConfig();
    this.extractors.push(
      new ErgoObservationExtractor(
        configs.contracts.ergo.addresses.lock,
        this.dataSource,
        this.tokenMap,
        this.logger.child('ergoObservationExtractor'),
      ),
    );
    this.extractors.push(
      createEventTrigger(
        NETWORKS.ergo.key,
        networkType,
        url,
        this.dataSource,
        configs.contracts.ergo,
        this.logger,
      ),
    );
    Object.keys(configs.chains).map(async (chain) => {
      const chainConfig = configs.chains[chain as ChainChoices];
      if ('active' in chainConfig && chainConfig.active) {
        const network = NETWORKS[chain as keyof typeof NETWORKS];
        const contract = configs.contracts[
          chain as keyof typeof configs.contracts
        ] as ChainConfigs;
        this.extractors.push(
          createEventTrigger(
            network.key,
            networkType,
            url,
            this.dataSource,
            contract,
            this.logger,
          ),
        );
      }
    });
    this.setStatus(ServiceStatus.dormant);
    return true;
  };

  /**
   * Stops the service by removing all registered extractors from the ErgoScanner.
   * @returns {Promise<boolean>} True if the service stopped successfully.
   */
  protected stop = async (): Promise<boolean> => {
    this.extractors.map((extractor) => {
      this.ergoScanner.removeExtractor(extractor);
    });
    this.setStatus(ServiceStatus.dormant);
    return true;
  };

  /**
   * Starts the service by initializing extractors for supported chains
   * and registering them with the  ErgoScanner.
   * @returns {Promise<boolean>} True if the service started successfully, false otherwise.
   */
  protected start = async (): Promise<boolean> => {
    await Promise.all(
      this.extractors.map(async (extractor) => {
        await this.ergoScanner.registerExtractor(extractor);
      }),
    );

    this.setStatus(ServiceStatus.running);
    return true;
  };

  /**
   * Constructs a new ErgoExtractorService.
   * @param {ErgoScanner} ergoScanner Instance of ErgoScanner to use.
   * @param {AbstractLogger} logger instance.
   */
  protected constructor(logger: AbstractLogger = new DummyLogger()) {
    super(logger);
  }

  /**
   * initializes the singleton instance of ErgoExtractorService
   *
   * @static
   * @param {AbstractLogger} [logger]
   * @memberof ErgoExtractorService
   */
  static init = async (logger?: AbstractLogger): Promise<void> => {
    if (AbstractErgoExtractorsService.instance != undefined) {
      return;
    }
    AbstractErgoExtractorsService.instance = new ErgoExtractorService(logger);
  };
}
