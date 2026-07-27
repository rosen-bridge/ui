import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { BlockEntity, PROCEED } from '@rosen-bridge/abstract-scanner';
import { BoxEntity } from '@rosen-bridge/address-extractor';
import { DataSource, IsNull } from '@rosen-bridge/extended-typeorm';
import { LastSavedBlock } from '@rosen-bridge/scanner-sync-check';
import { Dependency, ServiceStatus } from '@rosen-bridge/service-manager';

import { TOKEN_MAP_EXTRACTOR_ID } from '../constants';
import { AbstractDBService } from './abstracts';

export class DBService extends AbstractDBService {
  static serviceName = AbstractDBService.name;
  protected dataSource: DataSource;
  protected dependencies: Dependency[] = [];

  /**
   * Assembles the service by initializing dependencies
   * @async
   * @returns {Promise<boolean>} Resolves to `true` when the assembly is successfully completed.
   */
  protected assemble = async (): Promise<boolean> => {
    this.logger.debug('Initializing data source');
    await this.dataSource.initialize();
    this.logger.info('data source initialized');
    this.setStatus(ServiceStatus.dormant);
    return true;
  };

  /**
   * Protected constructor
   * @param {DataSource} dataSource
   * @param {AbstractLogger} [logger] - Optional logger instance for recording service operations.
   */
  protected constructor(dataSource: DataSource, logger?: AbstractLogger) {
    super(logger);
    this.dataSource = dataSource;
  }

  /**
   * Returns the last saved block height based on the scanner name
   *
   * @param scanner considering scanned blocks by this scanner
   */
  getLastSavedBlock = async (scanner: string): Promise<LastSavedBlock> => {
    const lastBlock = await this.dataSource.getRepository(BlockEntity).find({
      where: { status: PROCEED, scanner: scanner },
      order: { height: 'DESC' },
      take: 1,
    });
    if (lastBlock.length !== 0) {
      return { height: lastBlock[0].height, timestamp: lastBlock[0].timestamp };
    }
    throw new Error('No block found or error in database connection');
  };

  /**
   * Returns of dataSource
   *
   * @returns {DataSource} dataSource
   */
  getDataSource = (): DataSource => {
    return this.dataSource;
  };

  /**
   * Initializes the singleton instance of DBService
   *
   * @static
   * @param {DataSource} dataSource
   * @param {AbstractLogger} [logger]
   * @memberof DBService
   */
  static init = (dataSource: DataSource, logger?: AbstractLogger) => {
    if (AbstractDBService.instance != undefined) {
      return;
    }
    AbstractDBService.instance = new DBService(dataSource, logger);
  };

  /**
   * Starts DB service
   *
   * @returns void
   */
  protected start = async (): Promise<boolean> => {
    this.logger.debug('running data source migrations');
    await this.dataSource.runMigrations();
    this.logger.info('data source migrations completed');
    this.setStatus(ServiceStatus.running);
    return true;
  };

  /**
   * Stops DB service
   *
   * @returns void
   */
  protected stop = async (): Promise<boolean> => {
    this.setStatus(ServiceStatus.dormant);
    return true;
  };

  /**
   * Gets an array of unspent token-map boxes
   */
  getTokenMapBoxes = async (): Promise<BoxEntity[]> => {
    const boxes = await this.dataSource.getRepository(BoxEntity).find({
      where: { extractor: TOKEN_MAP_EXTRACTOR_ID, spendHeight: IsNull() },
    });

    return boxes;
  };
}
