import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { TokenMap } from '@rosen-bridge/tokens';
import fs from 'node:fs';
import path from 'node:path';

import { configs } from './configs';

class TokensConfig {
  private static instance: TokensConfig;
  protected tokenMap: TokenMap;

  private constructor(protected logger: AbstractLogger = new DummyLogger()) {
    this.logger.debug(`New instance of TokensConfig created`);
  }

  /**
   * initializes TokensConfig with tokens from the specified path
   * @param tokensPath path to tokens json file
   */
  static async init(logger?: AbstractLogger): Promise<void> {
    if (!TokensConfig.instance) {
      const tokensPath = path.resolve(configs.paths.tokens);
      if (!fs.existsSync(tokensPath)) {
        throw new Error(`tokensMap file with path ${tokensPath} doesn't exist`);
      }
      TokensConfig.instance = new TokensConfig(logger);
      const tokensJson: string = fs.readFileSync(tokensPath, 'utf8');
      const tokens = JSON.parse(tokensJson);
      TokensConfig.instance.tokenMap = new TokenMap();
      await TokensConfig.instance.tokenMap.updateConfigByJson(tokens.tokens);
      TokensConfig.instance.logger.info(
        `TokenMap config successfully updated by ${JSON.stringify(tokens.tokens)} tokens info.`,
      );
    }
  }

  /**
   * returns the TokensConfig instance if initialized
   * @returns TokensConfig instance
   */
  static getInstance(): TokensConfig {
    if (!TokensConfig.instance) {
      throw new Error('TokensConfig is not initialized');
    }
    return TokensConfig.instance;
  }

  /**
   * @returns the token map
   */
  getTokenMap(): TokenMap {
    return this.tokenMap;
  }
}

export { TokensConfig };
