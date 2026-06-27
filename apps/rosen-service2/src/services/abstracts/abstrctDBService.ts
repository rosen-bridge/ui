import { BoxEntity } from '@rosen-bridge/address-extractor';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { LastSavedBlock } from '@rosen-bridge/scanner-sync-check';
import { AbstractService } from '@rosen-bridge/service-manager';

export abstract class AbstractDBService extends AbstractService {
  static name = 'DB';
  protected static instance: AbstractDBService;

  /**
   * Returns the singleton instance of AbstractDBService
   *
   * @static
   * @return {AbstractDBService}
   * @memberof AbstractDBService
   */
  static getInstance = (): AbstractDBService => {
    return AbstractDBService.instance;
  };

  /**
   * Returns of dataSource
   *
   * @returns {DataSource} dataSource
   */
  abstract getDataSource: () => DataSource;

  /**
   * Gets an array of unspent token-map boxes
   */
  abstract getTokenMapBoxes: () => Promise<BoxEntity[]>;

  /**
   * Returns the last saved block height based on the scanner name
   *
   * @param scanner considering scanned blocks by this scanner
   */
  abstract getLastSavedBlock: (scanner: string) => Promise<LastSavedBlock>;
}
