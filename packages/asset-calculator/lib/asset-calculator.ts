import {
  TokenMap,
  RosenTokens,
  RosenChainToken,
  NATIVE_TOKEN,
} from '@rosen-bridge/tokens';
import { DummyLogger, AbstractLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from 'typeorm';
import { difference, differenceWith, isEqual } from 'lodash-es';
import JsonBigInt from '@rosen-bridge/json-bigint';

import { CardanoCalculator } from './calculator/chains/cardano-calculator';
import { ErgoCalculator } from './calculator/chains/ergo-calculator';
import {
  CardanoCalculatorInterface,
  ErgoCalculatorInterface,
} from './interfaces';
import { CARDANO_CHAIN, ERGO_CHAIN } from './constants';
import { BridgedAssetModel } from './database/bridgedAsset/BridgedAssetModel';
import { TokenModel } from './database/token/TokenModel';
import AbstractCalculator from './calculator/abstract-calculator';

class AssetCalculator {
  protected readonly tokens: TokenMap;
  protected readonly assetModel: BridgedAssetModel;
  protected readonly tokenModel: TokenModel;
  protected calculatorMap: Map<string, AbstractCalculator> = new Map();

  constructor(
    tokens: RosenTokens,
    ergoCalculator: ErgoCalculatorInterface,
    cardanoCalculator: CardanoCalculatorInterface,
    dataSource: DataSource,
    protected readonly logger: AbstractLogger = new DummyLogger()
  ) {
    this.tokens = new TokenMap(tokens);
    const ergoAssetCalculator = new ErgoCalculator(
      ergoCalculator.addresses,
      ergoCalculator.explorerUrl,
      logger
    );
    const cardanoAssetCalculator = new CardanoCalculator(
      cardanoCalculator.addresses,
      cardanoCalculator.authToken,
      logger,
      cardanoCalculator.koiosUrl
    );
    this.calculatorMap.set(ERGO_CHAIN, ergoAssetCalculator);
    this.calculatorMap.set(CARDANO_CHAIN, cardanoAssetCalculator);
    this.assetModel = new BridgedAssetModel(dataSource, logger);
    this.tokenModel = new TokenModel(dataSource, logger);
  }

  /**
   * get token id of a RosenChainToken on resident chain
   * @param token
   * @param residencyChain
   */
  private getTokenIdOnResidentChain = (
    token: RosenChainToken,
    residencyChain: string
  ): string => {
    const chainIdKey = this.tokens.getIdKey(residencyChain);

    return token[chainIdKey];
  };

  /**
   * get a token data on a specific chain
   * @param residentToken
   * @param residencyChain
   * @param chain
   */
  private getTokenDataForChain = (
    residentToken: RosenChainToken,
    residencyChain: string,
    chain: string
  ) => {
    const chainIdKey = this.tokens.getIdKey(residencyChain);
    const tokenDataOnAllChains = this.tokens.search(residencyChain, {
      [chainIdKey]: residentToken[chainIdKey],
    })[0];

    return tokenDataOnAllChains[chain];
  };

  /**
   * Calculate emission of a token on a specific chain by subtracting the bridge
   * balance from total token supply
   * @param supportedChains
   * @param token
   * @param residencyChain
   */
  private calculateEmissionForChain = async (
    token: RosenChainToken,
    chain: string,
    residencyChain: string
  ): Promise<bigint> => {
    const calculator = this.calculatorMap.get(chain);

    if (!calculator)
      throw Error(`Chain [${chain}] is not supported in asset calculator`);

    const chainToken = this.getTokenDataForChain(token, residencyChain, chain);
    const emission =
      (await calculator.totalSupply(chainToken)) -
      (await calculator.totalBalance(chainToken));

    this.logger.debug(
      `Emitted amount of asset [${this.getTokenIdOnResidentChain(
        token,
        residencyChain
      )}] in chain [${chain}] is [${emission}]`
    );

    return emission;
  };

  /**
   * Updates all tokens details in all supported networks and remove unused
   * old tokens from the database
   */
  update = async () => {
    const allStoredBridgedAssets = await this.assetModel.getAllStoredAssets();
    this.logger.debug(
      `All current stored assets are ${allStoredBridgedAssets}`
    );
    const allStoredTokens = await this.tokenModel.getAllStoredTokens();
    this.logger.debug(
      `All current stored tokens are ${allStoredBridgedAssets}`
    );

    const allCurrentBridgedAssets = [];
    const allCurrentTokens = [];

    const residencyChains = this.tokens.getAllChains();

    for (const residencyChain of residencyChains) {
      const chainIdKey = this.tokens.getIdKey(residencyChain);

      const nativeResidentTokens =
        this.tokens.getAllNativeTokens(residencyChain);
      this.logger.debug(
        `All native resident tokens of ${residencyChain} chain are ${JsonBigInt.stringify(
          nativeResidentTokens
        )}`
      );

      const chains = this.tokens.getSupportedChains(residencyChain);

      for (const nativeResidentToken of nativeResidentTokens) {
        const newToken = {
          id: nativeResidentToken[chainIdKey],
          decimal: nativeResidentToken.decimals,
          name: nativeResidentToken.name,
          chain: residencyChain,
          isNative: nativeResidentToken.metaData.type === NATIVE_TOKEN,
        };
        await this.tokenModel.insertToken(newToken);
        allCurrentTokens.push(newToken.id);

        try {
          for (const chain of chains) {
            const emission = await this.calculateEmissionForChain(
              nativeResidentToken,
              chain,
              residencyChain
            );
            this.logger.debug(
              `Asset [${nativeResidentToken[chainIdKey]}] total locked amount is [${emission}]`
            );

            const newBridgedAsset = {
              amount: emission,
              chain: chain,
              token: newToken,
              tokenId: newToken.id,
            };
            await this.assetModel.upsertAsset(newBridgedAsset);
            allCurrentBridgedAssets.push({
              tokenId: newBridgedAsset.tokenId,
              chain: newBridgedAsset.chain,
            });
            this.logger.info(
              `Updated asset [${nativeResidentToken[chainIdKey]}] total locked amount to [${emission}]`
            );
            this.logger.debug(
              `Updated asset details for [${JsonBigInt.stringify(
                newBridgedAsset
              )}]`
            );
          }
        } catch (e) {
          this.logger.warn(
            `Skipping asset [${nativeResidentToken[chainIdKey]}] locked amount update, error: [${e}]`
          );
          if (e instanceof Error && e.stack)
            this.logger.debug(`Error stack trace: [${e.stack}]`);
        }
      }
    }
    const oldBridgedAssets = differenceWith(
      allStoredBridgedAssets,
      allCurrentBridgedAssets,
      isEqual
    );
    const oldTokens = difference(allStoredTokens, allCurrentTokens);
    await this.assetModel.removeAssets(oldBridgedAssets);
    await this.tokenModel.removeTokens(oldTokens);
  };
}

export default AssetCalculator;
