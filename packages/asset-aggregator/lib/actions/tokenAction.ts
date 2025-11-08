import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource, In, Repository } from '@rosen-bridge/extended-typeorm';
import JsonBigInt from '@rosen-bridge/json-bigint';

import { TokenEntity } from '../entities';

export class TokenAction {
  protected readonly repository: Repository<TokenEntity>;

  constructor(
    protected dataSource: DataSource,
    protected logger: AbstractLogger = new DummyLogger(),
  ) {
    this.repository = dataSource.getRepository(TokenEntity);
  }

  /**
   * Stores one or more tokens into the database
   *
   * @param tokens - Single TokenEntity or array of TokenEntity objects to insert
   * @returns Promise that resolves to the inserted tokens
   */
  store = async (tokens: TokenEntity[] | TokenEntity) => {
    if (!(tokens instanceof Array)) tokens = [tokens];
    await this.repository.save(tokens);
    this.logger.debug(
      `Token [${JsonBigInt.stringify(tokens)}] inserted into database`,
    );
    return tokens;
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
   * Removes all items from the array except the ones with the specified excludeTokenIds.
   *
   * @param excludeTokenIds
   */
  keepOnly = async (excludeTokenIds: string[] | string) => {
    if (!(excludeTokenIds instanceof Array))
      excludeTokenIds = [excludeTokenIds];

    const allTokenObjs = await this.repository.find({ select: ['id'] });
    const allTokenIds = allTokenObjs.map((obj) => obj.id);

    // Filter tokens that should be removed
    const toRemove = allTokenIds.filter((id) => !excludeTokenIds.includes(id));
    await this.deleteInChunks(toRemove);
  };
}
