import {
  TokenMap,
  RosenTokens,
  RosenChainToken,
  NATIVE_RESIDENCY,
} from '@rosen-bridge/tokens';
import { DummyLogger, AbstractLogger } from '@rosen-bridge/abstract-logger';
import { DataSource } from 'typeorm';
import { difference } from 'lodash-es';
import JsonBigInt from '@rosen-bridge/json-bigint';

import { CardanoCalculator } from './calculator/chains/cardano-calculator';
import { ErgoCalculator } from './calculator/chains/ergo-calculator';
import {
  CardanoCalculatorInterface,
  ErgoCalculatorInterface,
} from './interfaces';
import { CARDANO_CHAIN, ERGO_CHAIN } from './constants';
import { AssetModel } from './database/asset-model';
import AbstractCalculator from './calculator/abstract-calculator';

class AssetCalculator {
  protected readonly tokens: TokenMap;
  protected readonly assetModel: AssetModel;
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
    this.assetModel = new AssetModel(dataSource, logger);
  }

  /**
   * Calculate total locked amount of a token by aggregating its emitted
   * amounts in all supported chains
   * The emitted amount in a chain is calculated by subtracting the bridge
   * balance from total token supply
   * @param supportedChains
   * @param token
   * @param sourceChain
   * @returns total locked amount of token
   */
  protected calculateTotalLocked = async (
    supportedChains: string[],
    token: RosenChainToken,
    sourceChain: string
  ): Promise<bigint> => {
    let totalLocked = 0n;
    const chainIdKey = this.tokens.getIdKey(sourceChain);
    const rosenChainToken = this.tokens.search(sourceChain, {
      [chainIdKey]: token[chainIdKey],
    })[0];
    for (const supportedChain of supportedChains) {
      const targetChainToken = rosenChainToken[supportedChain];
      const calculator = this.calculatorMap.get(supportedChain);
      if (!calculator)
        throw Error(
          `Chain [${supportedChain}] is not supported in asset calculator`
        );
      const emittedAmount =
        (await calculator.totalSupply(targetChainToken)) -
        (await calculator.totalBalance(targetChainToken));
      this.logger.debug(
        `Emitted amount of asset [${token[chainIdKey]}] in chain [${supportedChain}] is [${emittedAmount}]`
      );
      totalLocked += emittedAmount;
    }
    return totalLocked;
  };

  /**
   * Updates all tokens details in all supported networks and remove unused
   * old tokens from the database
   */
  update = async () => {
    const allStoredAssets = await this.assetModel.getAllStoredAssets();
    this.logger.debug(`All current stored assets are ${allStoredAssets}`);
    const allUpdatesAssets = [];
    const chains = this.tokens.getAllChains();
    for (const chain of chains) {
      const chainIdKey = this.tokens.getIdKey(chain);
      const nativeResidentTokens = this.tokens.getAllNativeTokens(chain);
      this.logger.debug(
        `All native resident tokens of ${chain} chain are ${nativeResidentTokens}`
      );
      const supportedChains = this.tokens.getSupportedChains(chain);
      for (const token of nativeResidentTokens) {
        try {
          const totalLocked = await this.calculateTotalLocked(
            supportedChains,
            token,
            chain
          );
          this.logger.debug(
            `Asset [${token[chainIdKey]}] total locked amount is [${totalLocked}]`
          );

          const updatedAsset = {
            id: token[chainIdKey],
            name: token.name,
            decimal: token.decimals,
            isNative: token.metaData.type == NATIVE_RESIDENCY,
            amount: totalLocked,
          };
          await this.assetModel.updateAsset(updatedAsset);
          allUpdatesAssets.push(token[chainIdKey]);
          this.logger.info(
            `Updated asset [${token[chainIdKey]}] total locked amount to [${totalLocked}]`
          );
          this.logger.debug(
            `Updated asset details for [${JsonBigInt.stringify(updatedAsset)}]`
          );
        } catch (e) {
          this.logger.warn(
            `Skipping asset [${token[chainIdKey]}] locked amount update, error: [${e}]`
          );
          if (e instanceof Error && e.stack)
            this.logger.debug(`Error stack trace: [${e.stack}]`);
        }
      }
    }
    const oldAssets = difference(allStoredAssets, allUpdatesAssets);
    this.logger.debug(`Removing old assets [${oldAssets}]`);
    await this.assetModel.removeAssets(oldAssets);
  };
}

export { AssetCalculator };
export * from './interfaces';
