import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import {
  DataSource,
  In,
  Not,
  Repository,
} from '@rosen-bridge/extended-typeorm';
import JsonBigInt from '@rosen-bridge/json-bigint';

import { DEFAULT_DELETE_CHUNK_SIZE } from '../constants';
import { BridgedAssetEntity } from '../entities';

export class BridgedAssetAction {
  protected readonly repository: Repository<BridgedAssetEntity>;

  constructor(
    protected dataSource: DataSource,
    protected logger: AbstractLogger = new DummyLogger(),
  ) {
    this.repository = dataSource.getRepository(BridgedAssetEntity);
  }

  /**
   * Stores one or more bridged assets in the database
   * @param assets - Single BridgedAssetEntity or array of BridgedAssetEntity objects to store
   * @returns Promise that resolves when all assets are saved
   */
  store = async (
    assets:
      | Omit<BridgedAssetEntity, 'token'>[]
      | Omit<BridgedAssetEntity, 'token'>,
  ) => {
    if (!(assets instanceof Array)) assets = [assets];
    await this.repository.save(assets);
    this.logger.debug(
      `Bridged-assets [${JsonBigInt.stringify(assets)}] stored in database`,
    );
  };

  /**
   * Deletes tokens in chunks for efficiency.
   * @param tokenIds array of tokenIds to delete
   */
  protected async deleteInChunks(tokenIds: string[]) {
    let offset = 0;
    while (offset < tokenIds.length) {
      const chunk = tokenIds.slice(offset, offset + DEFAULT_DELETE_CHUNK_SIZE);
      await this.repository.delete({ tokenId: In(chunk) });
      offset += DEFAULT_DELETE_CHUNK_SIZE;
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
