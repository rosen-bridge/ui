import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { BlockEntity, PROCEED } from '@rosen-bridge/abstract-scanner';
import { BoxEntity } from '@rosen-bridge/address-extractor';
import { DataSource, IsNull } from '@rosen-bridge/extended-typeorm';
import { LastSavedBlock } from '@rosen-bridge/scanner-sync-check';
import { Dependency, ServiceStatus } from '@rosen-bridge/service-manager';

import { TOKEN_MAP_EXTRACTOR_ID } from '../constants';
import { AbstractDBService } from './types/abstrctDb';

export class DBService extends AbstractDBService {
  name = AbstractDBService.Name;
  readonly dataSource: DataSource;

  assemble = async (): Promise<boolean> => {
    try {
      this.logger.debug('Initializing data source');
      await this.dataSource.initialize();
      this.logger.debug('data source initialized');

      this.logger.debug('running data source migrations');
      await this.dataSource.runMigrations();
      this.logger.debug('data source migrations completed');
    } catch (e) {
      this.logger.error(
        `Something went wrong while starting the DBService: ${e}`,
      );
    }
    this.setStatus(ServiceStatus.dormant);
    return true;
  };

  private constructor(dataSource: DataSource, logger?: AbstractLogger) {
    super(logger);
    this.dataSource = dataSource;
  }

  /**
   * returns the last saved block height based on the scanner name
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
   * return of dataSource
   *
   * @returns {DataSource} dataSource
   */
  getDataSource = (): DataSource => {
    return this.dataSource;
  };

  /**
   * initializes the singleton instance of DBService
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

  protected dependencies: Dependency[] = [];

  protected start = async (): Promise<boolean> => {
    this.setStatus(ServiceStatus.running);

    return true;
  };

  protected stop = async (): Promise<boolean> => {
    this.setStatus(ServiceStatus.dormant);
    return true;
  };

  /**
   * gets an array of unspent token-map boxes
   */
  getTokenMapBoxes = async (): Promise<BoxEntity[]> => {
    const boxes = await this.dataSource.getRepository(BoxEntity).find({
      where: { extractor: TOKEN_MAP_EXTRACTOR_ID, spendHeight: IsNull() },
    });

    return boxes;
  };
}
