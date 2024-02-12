import { TokenMap, RosenTokens, RosenChainToken } from '@rosen-bridge/tokens';
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
import { CARDANO_CHAIN, ERGO_CHAIN, NATIVE_TOKEN } from './constants';
import { AssetModel } from './database/asset-model';

export class AssetCalculator {
  protected readonly tokens: TokenMap;
  protected readonly ergoAssetCalculator: ErgoCalculator;
  protected readonly cardanoAssetCalculator: CardanoCalculator;
  protected readonly assetModel: AssetModel;

  constructor(
    tokens: RosenTokens,
    ergoCalculator: ErgoCalculatorInterface,
    cardanoCalculator: CardanoCalculatorInterface,
    dataSource: DataSource,
    protected readonly logger: AbstractLogger = new DummyLogger()
  ) {
    this.tokens = new TokenMap(tokens);
    this.ergoAssetCalculator = new ErgoCalculator(
      ergoCalculator.calculatorAddresses,
      ergoCalculator.explorerUrl,
      logger
    );
    this.cardanoAssetCalculator = new CardanoCalculator(
      cardanoCalculator.calculatorAddresses,
      cardanoCalculator.koiosUrl,
      cardanoCalculator.authToken,
      logger
    );
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
  calculateTotalLocked = async (
    supportedChains: string[],
    token: RosenChainToken,
    sourceChain: string
  ): Promise<bigint> => {
    let totalLocked = 0n;
    const chainIdKey = this.tokens.getIdKey(sourceChain);
    for (const supportedChain of supportedChains) {
      let emittedAmount = 0n;
      const targetChainToken = this.tokens.search(supportedChain, {
        [chainIdKey]: token[chainIdKey],
      })[0][supportedChain];
      if (supportedChain == ERGO_CHAIN) {
        emittedAmount =
          (await this.ergoAssetCalculator.totalSupply(targetChainToken)) -
          (await this.ergoAssetCalculator.totalBalance(targetChainToken));
      } else if (supportedChain == CARDANO_CHAIN) {
        emittedAmount =
          (await this.cardanoAssetCalculator.totalSupply(targetChainToken)) -
          (await this.cardanoAssetCalculator.totalBalance(targetChainToken));
      } else {
        throw Error(
          `Chain [${supportedChain}] is not supported in asset calculator`
        );
      }
      this.logger.debug(
        `Emitted amount of asset ${token[chainIdKey]} in ${supportedChain} is [${emittedAmount}]`
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
      // TODO use native tokens of chains
      const nativeResidentTokens = this.tokens.getTokens(chain, ERGO_CHAIN);
      this.logger.debug(
        `All native resident tokens of ${chain} chain are ${nativeResidentTokens}`
      );
      const supportedChains = this.tokens.getSupportedChains(chain);
      for (const token of nativeResidentTokens) {
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
          isNative: token.metaData.type == NATIVE_TOKEN,
          amount: totalLocked,
        };
        // TODO: update NATIVE_TOKEN
        this.assetModel.updateAsset(updatedAsset);
        allUpdatesAssets.push(token[chainIdKey]);
        this.logger.info(
          `Updated asset [${token[chainIdKey]}] total locked amount to [${totalLocked}]`
        );
        this.logger.debug(
          `Updated asset details for [${JsonBigInt.stringify(updatedAsset)}]`
        );
      }
    }
    const oldAssets = difference(allStoredAssets, allUpdatesAssets);
    this.logger.debug(`Removing old assets [${oldAssets}]`);
    await this.assetModel.removeUnusedAssets(oldAssets);
  };
}
