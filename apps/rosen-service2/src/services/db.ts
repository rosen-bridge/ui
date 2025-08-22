import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { BlockEntity, PROCEED } from '@rosen-bridge/scanner';
import {
  AbstractService,
  Dependency,
  ServiceStatus,
} from '@rosen-bridge/service-manager';

export class DBService extends AbstractService {
  name = 'DBService';
  private static instance: DBService;
  readonly dataSource: DataSource;

  private constructor(dataSource: DataSource, logger?: AbstractLogger) {
    super(logger);
    this.dataSource = dataSource;
  }

  /**
   * returns the last saved block height based on the scanner name
   * @param scanner considering scanned blocks by this scanner
   */
  public getLastSavedBlock = async (scanner: string) => {
    const lastBlock = await this.dataSource.getRepository(BlockEntity).find({
      where: { status: PROCEED, scanner: scanner },
      order: { height: 'DESC' },
      take: 1,
    });
    if (lastBlock.length !== 0) {
      return lastBlock[0];
    }
    throw new Error('No block found or error in database connection');
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
    if (this.instance != undefined) {
      return;
    }
    this.instance = new DBService(dataSource, logger);
  };

  /**
   * return the singleton instance of DBService
   *
   * @static
   * @return {DBService}
   * @memberof DBService
   */
  static getInstance = (): DBService => {
    if (!this.instance) {
      throw new Error(`${this.name} instances is not initialized yet`);
    }
    return this.instance;
  };

  protected dependencies: Dependency[] = [];

  protected start = async (): Promise<boolean> => {
    try {
      this.logger.debug('Initializing data source');
      await this.dataSource.initialize();
      this.logger.debug('data source initialized');

      this.logger.debug('running data source migrations');
      await this.dataSource.runMigrations();
      this.logger.debug('data source migrations completed');

      this.setStatus(ServiceStatus.running);
    } catch (e) {
      this.logger.error(
        `Something went wrong while starting the DBService: ${e}`,
      );
      return false;
    }
    return true;
  };

  protected stop = async (): Promise<boolean> => {
    this.setStatus(ServiceStatus.dormant);
    return true;
  };
}
