import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { DataSource, Repository } from '@rosen-bridge/extended-typeorm';
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
}
