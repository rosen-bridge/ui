import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource, In, Repository } from '@rosen-bridge/extended-typeorm';
import JsonBigInt from '@rosen-bridge/json-bigint';

import { LockedAssetEntity } from '../entities';

export class LockedAssetAction {
  protected readonly repository: Repository<LockedAssetEntity>;

  constructor(
    protected dataSource: DataSource,
    protected logger: AbstractLogger = new DummyLogger(),
  ) {
    this.repository = dataSource.getRepository(LockedAssetEntity);
  }

  /**
   * Stores one or more locked assets in the database
   * @param assets - Single LockedAssetEntity or array of LockedAssetEntity objects to store
   * @returns Promise that resolves when all assets are saved
   */
  store = async (assets: LockedAssetEntity[] | LockedAssetEntity) => {
    if (!(assets instanceof Array)) assets = [assets];
    await this.repository.save(assets);
    this.logger.debug(
      `Locked-assets [${JsonBigInt.stringify(assets)}] stored in database`,
    );
  };

  /**
   * Deletes tokens in chunks for efficiency.
   * @param tokenIds array of tokenIds to delete
   */
  protected async deleteInChunks(tokenIds: string[], chunkSize = 10) {
    let offset = 0;
    while (offset < tokenIds.length) {
      const chunk = tokenIds.slice(offset, offset + chunkSize);
      await this.repository.delete({ tokenId: In(chunk) });
      offset += chunkSize;
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

    const allTokenObjs = await this.repository.find({ select: ['tokenId'] });
    const allTokenIds = allTokenObjs.map((obj) => obj.tokenId);

    // Filter locked-assets that should be removed
    const toRemove = allTokenIds.filter((id) => !excludeTokenIds.includes(id));
    await this.deleteInChunks(toRemove);
  };
}
