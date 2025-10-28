import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource, In, Repository } from '@rosen-bridge/extended-typeorm';
import JsonBigInt from '@rosen-bridge/json-bigint';

import { TokenEntity } from '../entities';
import { IdInfoType, TokenIdInfoType } from '../types';

export class TokenAction {
  protected readonly repository: Repository<TokenEntity>;

  constructor(
    protected dataSource: DataSource,
    protected logger: AbstractLogger = new DummyLogger(),
  ) {
    this.repository = dataSource.getRepository(TokenEntity);
  }

  /**
   * Inserts one or more tokens into the database
   * @param tokens - Single TokenEntity or array of TokenEntity objects to insert
   * @returns Promise that resolves to the inserted tokens
   */
  insert = async (tokens: TokenEntity[] | TokenEntity) => {
    if (!(tokens instanceof Array)) tokens = [tokens];
    await this.repository.save(tokens);
    this.logger.debug(
      `Token [${JsonBigInt.stringify(tokens)}] inserted into database`,
    );
    return tokens;
  };

  /**
   * Retrieves all tokens from the database
   * @returns Promise that resolves to an array of objects containing token id information
   */
  getAll = async () => {
    return await this.repository.find({ select: ['id'] });
  };

  /**
   * Deletes tokens in chunks for efficiency.
   * @param tokenIds array of ids to delete
   */
  protected async deleteInChunks(tokenIds: string[], chunkSize = 10) {
    let offset = 0;
    while (offset < tokenIds.length) {
      const chunk = tokenIds.slice(offset, offset + chunkSize);
      await this.repository.delete({ id: In(chunk) });
      offset += chunkSize;
    }
    if (tokenIds.length)
      this.logger.debug(`Deleted tokens ${tokenIds} from the database`);
  }

  /**
   * Removes one or more tokens from the database in chunks.
   * @param tokenIds - Single TokenIdInfoType or array of TokenIdInfoType objects to delete
   * @returns Promise that resolves when all tokens are deleted
   */
  remove = async (tokenIds: TokenIdInfoType[] | TokenIdInfoType) => {
    if (!(tokenIds instanceof Array)) tokenIds = [tokenIds];
    const ids = tokenIds.map(
      (token) => (token as IdInfoType).id || token,
    ) as string[];
    await this.deleteInChunks(ids);
  };

  /**
   * Removes all items from the array except the ones with the specified excludeTokenIds.
   * @param excludeTokenIds
   */
  keepOnly = async (excludeTokenIds: TokenIdInfoType[] | TokenIdInfoType) => {
    if (!(excludeTokenIds instanceof Array))
      excludeTokenIds = [excludeTokenIds];
    excludeTokenIds = excludeTokenIds.map(
      (token) => (token as IdInfoType).id || token,
    );

    const allTokenObjs = await this.repository.find({ select: ['id'] });
    const allTokenIds = allTokenObjs.map((obj) => obj.id);

    // Filter tokens that should be removed
    const toRemove = allTokenIds.filter((id) => !excludeTokenIds.includes(id));
    await this.deleteInChunks(toRemove);
  };
}
