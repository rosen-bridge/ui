import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import JsonBigInt from '@rosen-bridge/json-bigint';
import { DataSource, In, Repository } from 'typeorm';

import { TokenEntity } from './TokenEntity';

class TokenModel {
  protected readonly tokenRepository: Repository<TokenEntity>;
  protected readonly logger: AbstractLogger;

  constructor(dataSource: DataSource, logger = new DummyLogger()) {
    this.tokenRepository = dataSource.getRepository(TokenEntity);
    this.logger = logger;
  }

  /**
   * Insert a token with specified information
   * @param token
   */
  insertToken = async (token: TokenEntity) => {
    const savedToken = await this.tokenRepository.findOne({
      where: { id: token.id },
    });
    if (savedToken) {
      this.logger.debug(
        `Token [${JsonBigInt.stringify(token)}] already exists in the database`,
      );
      return;
    }
    await this.tokenRepository.insert(token);
    this.logger.debug(
      `Token [${JsonBigInt.stringify(token)}] inserted into database`,
    );
    return token;
  };

  /**
   * Return all stored token ids
   */
  getAllStoredTokens = async (): Promise<string[]> => {
    return (await this.tokenRepository.find({ select: ['id'] })).map(
      (token) => token.id,
    );
  };

  /**
   * Remove old unused tokens from the database
   * @param tokenIds
   */
  removeTokens = async (tokenIds: string[]) => {
    await this.tokenRepository.delete({ id: In(tokenIds) });
    tokenIds.length &&
      this.logger.debug(`Deleted tokens ${tokenIds} from the database`);
  };
}

export { TokenModel };
