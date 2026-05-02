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
import { NETWORKS } from '@rosen-ui/constants';
import 'constants';

import { configs } from '../configs';
import { createEventTrigger } from '../scanners/ergo';
import { resolveErgoNetworkConfig } from '../utils';
import { AbstractErgoExtractorsService } from './types/abstractErgoExtractor';
import { AbstractErgoScannerService } from './types/abstractErgoScanner';
import { AbstractTokenMapService } from './types/abstractTokenMapService';
import { AbstractDBService } from './types/abstrctDb';

export class ErgoExtractorService extends AbstractErgoExtractorsService {
  private ergoScanner: ErgoScanner;
  name = AbstractErgoExtractorsService.Name;
  private tokenMap: TokenMap;
  private dataSource: DataSource;
  protected dependencies: Dependency[] = [
    {
      serviceName: AbstractTokenMapService.Name,
      allowedStatuses: [
        ServiceStatus.started,
        ServiceStatus.running,
        ServiceStatus.dormant,
      ],
      action: ServiceAction.assemble,
    },
    {
      serviceName: AbstractDBService.Name,
      allowedStatuses: [
        ServiceStatus.started,
        ServiceStatus.running,
        ServiceStatus.dormant,
      ],
      action: ServiceAction.assemble,
    },
  ];

  assemble = async (): Promise<boolean> => {
    this.ergoScanner =
      AbstractErgoScannerService.getInstance().getErgoScanner();
    this.dataSource = AbstractDBService.getInstance().getDataSource();
    this.tokenMap = AbstractTokenMapService.getInstance().getTokenMap();
    this.setStatus(ServiceStatus.dormant);
    return true;
  };

  /**
   * Stops the service by removing all registered extractors from the ErgoScanner.
   * @returns {Promise<boolean>} True if the service stopped successfully.
   */
  protected stop = async (): Promise<boolean> => {
    this.ergoScanner.extractors.map((extractors) => {
      this.ergoScanner.removeExtractor(extractors);
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
    this.setStatus(ServiceStatus.started);
    const { networkType, url } = resolveErgoNetworkConfig();
    try {
      const ergoObservationExtractor = new ErgoObservationExtractor(
        configs.contracts.ergo.addresses.lock,
        this.dataSource,
        this.tokenMap,
        this.logger.child('ergoObservationExtractor'),
      );
      await this.ergoScanner.registerExtractor(ergoObservationExtractor);
      const ergoEventTriggerExtractor = createEventTrigger(
        NETWORKS.ergo.key,
        networkType,
        url,
        this.dataSource,
        configs.contracts.ergo,
      );
      await this.ergoScanner.registerExtractor(ergoEventTriggerExtractor);
      if (configs.chains.cardano.active)
        await this.ergoScanner.registerExtractor(
          createEventTrigger(
            NETWORKS.cardano.key,
            networkType,
            url,
            this.dataSource,
            configs.contracts.cardano,
          ),
        );
      if (configs.chains.bitcoin.active)
        await this.ergoScanner.registerExtractor(
          createEventTrigger(
            NETWORKS.binance.key,
            networkType,
            url,
            this.dataSource,
            configs.contracts.bitcoin,
          ),
        );
      if (configs.chains.doge.active)
        await this.ergoScanner.registerExtractor(
          createEventTrigger(
            NETWORKS.doge.key,
            networkType,
            url,
            this.dataSource,
            configs.contracts.doge,
          ),
        );
      if (configs.chains.ethereum.active)
        await this.ergoScanner.registerExtractor(
          createEventTrigger(
            NETWORKS.ethereum.key,
            networkType,
            url,
            this.dataSource,
            configs.contracts.ethereum,
          ),
        );
      if (configs.chains['bitcoin-runes'].active)
        await this.ergoScanner.registerExtractor(
          createEventTrigger(
            NETWORKS['bitcoin-runes'].key,
            networkType,
            url,
            this.dataSource,
            configs.contracts['bitcoin-runes'],
          ),
        );
      if (configs.chains.binance.active)
        await this.ergoScanner.registerExtractor(
          createEventTrigger(
            NETWORKS.binance.key,
            networkType,
            url,
            this.dataSource,
            configs.contracts.binance,
          ),
        );
      this.setStatus(ServiceStatus.running);
      return true;
    } catch (e) {
      this.logger.error(
        `Something went wrong while starting the ErgoExtractorService: ${e}`,
      );
      return false;
    }
  };

  /**
   * Constructs a new ErgoExtractorService.
   * @param {ErgoScanner} ergoScanner Instance of ErgoScanner to use.
   * @param {AbstractLogger} logger instance.
   */
  constructor(logger: AbstractLogger = new DummyLogger()) {
    super(logger);
  }

  /**
   * initializes the singleton instance of ErgoExtractorService
   *
   * @static
   * @param {ErgoScanner} ergoScanner
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
