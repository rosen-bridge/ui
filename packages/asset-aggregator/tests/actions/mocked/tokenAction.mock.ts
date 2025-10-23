import { Network } from '@rosen-ui/types';

import { TokenEntity } from '../../../lib/entities/tokenEntity';

export class TokenMockData {
  static SAMPLE_REMOVE_IDS = ['tkn-1', 'tkn-2'];

  /**
   * Creates a single TokenEntity with sensible defaults.
   * Use overrides to customize values for a specific scenario.
   * @param overrides optional fields to override the defaults
   * @returns a TokenEntity instance ready to persist
   */
  static createSingleToken(overrides: Partial<TokenEntity> = {}): TokenEntity {
    const token = new TokenEntity();
    token.id = 'tkn-1';
    token.name = 'Token One';
    token.decimal = 9;
    token.isNative = false;
    token.chain = 'ergo' as Network;
    Object.assign(token, overrides);
    return token;
  }

  /**
   * Creates multiple TokenEntity instances with incremental ids and names.
   * Chain alternates between ergo and ethereum by index.
   * @param count number of entities to generate (default: 2)
   * @param baseOverrides optional fields applied to all generated entities
   * @returns an array of TokenEntity instances
   */
  static createMultipleTokens(
    count: number = 2,
    baseOverrides: Partial<TokenEntity> = {},
  ): TokenEntity[] {
    const tokens: TokenEntity[] = [];
    for (let i = 0; i < count; i++) {
      const token = new TokenEntity();
      token.id = `tkn-${i + 1}`;
      token.name = `Token ${i + 1}`;
      token.decimal = 9;
      token.isNative = i % 2 === 0;
      token.chain = i % 2 === 0 ? ('ergo' as Network) : ('ethereum' as Network);
      Object.assign(token, baseOverrides);
      tokens.push(token);
    }
    return tokens;
  }
}
