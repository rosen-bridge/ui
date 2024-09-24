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
import { BitcoinCalculator } from './calculator/chains/bitcoin-calculator';

import {
  BitcoinCalculatorInterface,
  CardanoCalculatorInterface,
  ErgoCalculatorInterface,
  EthereumCalculatorInterface,
} from './interfaces';
import {
  BITCOIN_CHAIN,
  CARDANO_CHAIN,
  ERGO_CHAIN,
  ETHEREUM_CHAIN,
} from './constants';
import { BridgedAssetModel } from './database/bridgedAsset/BridgedAssetModel';
import { TokenModel } from './database/token/TokenModel';
import AbstractCalculator from './calculator/abstract-calculator';
import { LockedAssetModel } from './database/lockedAsset/LockedAssetModel';
import { LockedAssetEntity } from './database/lockedAsset/LockedAssetEntity';
import { EvmCalculator } from './calculator/chains/evm-calculator';

class AssetCalculator {
  protected readonly tokens: TokenMap;
  protected readonly bridgedAssetModel: BridgedAssetModel;
  protected readonly lockedAssetModel: LockedAssetModel;
  protected readonly tokenModel: TokenModel;
  protected calculatorMap: Map<string, AbstractCalculator> = new Map();

  constructor(
    tokens: RosenTokens,
    ergoCalculator: ErgoCalculatorInterface,
    cardanoCalculator: CardanoCalculatorInterface,
    bitcoinCalculator: BitcoinCalculatorInterface,
    ethereumCalculator: EthereumCalculatorInterface,
    dataSource: DataSource,
    protected readonly logger: AbstractLogger = new DummyLogger()
  ) {
    this.tokens = new TokenMap(tokens);
    const ergoAssetCalculator = new ErgoCalculator(
      this.tokens,
      ergoCalculator.addresses,
      ergoCalculator.explorerUrl,
      logger
    );
    const cardanoAssetCalculator = new CardanoCalculator(
      this.tokens,
      cardanoCalculator.addresses,
      cardanoCalculator.authToken,
      logger,
      cardanoCalculator.koiosUrl
    );
    const bitcoinAssetCalculator = new BitcoinCalculator(
      this.tokens,
      bitcoinCalculator.addresses,
      bitcoinCalculator.esploraUrl,
      logger
    );
    const ethereumAssetCalculator = new EvmCalculator(
      ETHEREUM_CHAIN,
      this.tokens,
      ethereumCalculator.addresses,
      ethereumCalculator.rpcUrl,
      ethereumCalculator.authToken,
      logger
    );
    this.calculatorMap.set(ERGO_CHAIN, ergoAssetCalculator);
    this.calculatorMap.set(CARDANO_CHAIN, cardanoAssetCalculator);
    this.calculatorMap.set(BITCOIN_CHAIN, bitcoinAssetCalculator);
    this.calculatorMap.set(ETHEREUM_CHAIN, ethereumAssetCalculator);
    this.bridgedAssetModel = new BridgedAssetModel(dataSource, logger);
    this.lockedAssetModel = new LockedAssetModel(dataSource, logger);
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
   * Calculate locked amount of a resident token on a chain
   * @param supportedChains
   * @param token
   * @param residencyChain
   */
  private calculateLocked = async (
    token: RosenChainToken,
    residencyChain: string
  ) => {
    const calculator = this.calculatorMap.get(residencyChain);

    if (!calculator)
      throw Error(
        `Chain [${residencyChain}] is not supported in asset calculator`
      );

    const lockedAmountsPerAddress = await calculator.getLockedAmountsPerAddress(
      token
    );

    lockedAmountsPerAddress.forEach((lockedAmountPerAddress) =>
      this.logger.debug(
        `Locked amount of asset [${this.getTokenIdOnResidentChain(
          token,
          residencyChain
        )}] on address [${lockedAmountPerAddress.address}] is [${
          lockedAmountPerAddress.amount
        }]`
      )
    );

    return lockedAmountsPerAddress;
  };

  /**
   * Updates all tokens details in all supported networks and remove unused
   * old tokens from the database
   */
  update = async () => {
    const allStoredBridgedAssets =
      await this.bridgedAssetModel.getAllStoredAssets();
    this.logger.debug(
      `All current stored bridge assets are ${allStoredBridgedAssets}`
    );
    const allStoredLockedAssets =
      await this.lockedAssetModel.getAllStoredAssets();
    this.logger.debug(
      `All current stored locked assets are ${allStoredBridgedAssets}`
    );
    const allStoredTokens = await this.tokenModel.getAllStoredTokens();
    this.logger.debug(
      `All current stored tokens are ${allStoredBridgedAssets}`
    );

    const allCurrentBridgedAssets = [];
    const allCurrentLockedAssets: Partial<LockedAssetEntity>[] = [];
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

        const locked = await this.calculateLocked(
          nativeResidentToken,
          residencyChain
        );
        await Promise.all(
          locked.map(async (lockedItem) => {
            const newLockedAsset = {
              amount: lockedItem.amount,
              address: lockedItem.address,
              token: newToken,
              tokenId: newToken.id,
            };
            await this.lockedAssetModel.upsertAsset(newLockedAsset);
            allCurrentLockedAssets.push({
              tokenId: newLockedAsset.tokenId,
              address: newLockedAsset.address,
            });
            this.logger.info(
              `Updated asset [${nativeResidentToken[chainIdKey]}] total locked amount to [${lockedItem.amount}]`
            );
            this.logger.debug(
              `Updated asset details for [${JsonBigInt.stringify(
                newLockedAsset
              )}]`
            );
          })
        );

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

            const tokenDataOnAllChains = this.tokens.search(residencyChain, {
              [chainIdKey]: newToken.id,
            })[0];
            const bridgedTokenId = this.tokens.getID(
              tokenDataOnAllChains,
              chain
            );

            const newBridgedAsset = {
              amount: emission,
              chain: chain,
              token: newToken,
              tokenId: newToken.id,
              bridgedTokenId,
            };
            await this.bridgedAssetModel.upsertAsset(newBridgedAsset);
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
    const oldLockedAssets = differenceWith(
      allStoredLockedAssets,
      allCurrentLockedAssets,
      isEqual
    );
    const oldTokens = difference(allStoredTokens, allCurrentTokens);
    await this.bridgedAssetModel.removeAssets(oldBridgedAssets);
    await this.lockedAssetModel.removeAssets(oldLockedAssets);
    await this.tokenModel.removeTokens(oldTokens);
  };
}

export default AssetCalculator;
