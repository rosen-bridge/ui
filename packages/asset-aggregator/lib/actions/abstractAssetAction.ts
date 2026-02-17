import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import {
  DataSource,
  In,
  Not,
  Repository,
} from '@rosen-bridge/extended-typeorm';
import JsonBigInt from '@rosen-bridge/json-bigint';

import { DELETE_CHUNK_SIZE } from '../constants';
import { AbstractAssetEntity } from '../entities/abstractAssetEntity';

export abstract class AbstractAssetAction<Entity extends AbstractAssetEntity> {
  protected readonly repository: Repository<AbstractAssetEntity>;

  constructor(
    protected dataSource: DataSource,
    protected logger: AbstractLogger = new DummyLogger(),
  ) {}

  /**
   * Stores one or more assets in the database
   * @param assets - Single AssetEntity or array of AssetEntity objects to store
   * @returns Promise that resolves when all assets are saved
   */
  store = async (assets: Omit<Entity, 'token'>[] | Omit<Entity, 'token'>) => {
    if (!(assets instanceof Array)) assets = [assets];
    await this.repository.save(assets);
    this.logger.debug(
      `Assets [${JsonBigInt.stringify(assets)}] stored in database`,
    );
  };

  /**
   * Deletes tokens in chunks for efficiency.
   * @param tokenIds array of tokenIds to delete
   */
  protected async deleteInChunks(tokenIds: string[]) {
    let offset = 0;
    while (offset < tokenIds.length) {
      const chunk = tokenIds.slice(offset, offset + DELETE_CHUNK_SIZE);
      await this.repository.delete({ tokenId: In(chunk) });
      offset += DELETE_CHUNK_SIZE;
    }
    if (tokenIds.length)
      this.logger.debug(`Deleted tokens ${tokenIds} from the database`);
  }

  /**
   * Removes all items from the array except the ones with the specified excludeTokenIds.
   *
   * @param excludeTokenIds
   */
  keepOnly = async (excludeTokenIds: string[] | string) => {
    if (!(excludeTokenIds instanceof Array))
      excludeTokenIds = [excludeTokenIds];

    const toRemove = (
      await this.repository.find({
        select: ['tokenId'],
        where: { tokenId: Not(In(excludeTokenIds)) },
      })
    ).map((obj) => obj.tokenId);

    await this.deleteInChunks(toRemove);
  };
}
