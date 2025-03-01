import { DummyLogger, AbstractLogger } from '@rosen-bridge/abstract-logger';
import JsonBigInt from '@rosen-bridge/json-bigint';
import {
  TokenMap,
  RosenTokens,
  RosenChainToken,
  NATIVE_TOKEN,
} from '@rosen-bridge/tokens';
import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';
import { difference, differenceWith, isEqual } from 'lodash-es';
import { DataSource } from 'typeorm';

import AbstractCalculator from './calculator/abstract-calculator';
import { BitcoinCalculator } from './calculator/chains/bitcoin-calculator';
import { CardanoCalculator } from './calculator/chains/cardano-calculator';
import { ErgoCalculator } from './calculator/chains/ergo-calculator';
import { EvmCalculator } from './calculator/chains/evm-calculator';
import { BridgedAssetModel } from './database/bridgedAsset/BridgedAssetModel';
import { LockedAssetEntity } from './database/lockedAsset/LockedAssetEntity';
import { LockedAssetModel } from './database/lockedAsset/LockedAssetModel';
import { TokenModel } from './database/token/TokenModel';
import {
  BitcoinCalculatorInterface,
  CardanoCalculatorInterface,
  ErgoCalculatorInterface,
  EvmCalculatorInterface,
} from './interfaces';

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
    ethereumCalculator: EvmCalculatorInterface,
    binanceCalculator: EvmCalculatorInterface,
    dataSource: DataSource,
    protected readonly logger: AbstractLogger = new DummyLogger(),
  ) {
    this.tokens = new TokenMap(tokens);
    const ergoAssetCalculator = new ErgoCalculator(
      this.tokens,
      ergoCalculator.addresses,
      ergoCalculator.explorerUrl,
      logger,
    );
    const cardanoAssetCalculator = new CardanoCalculator(
      this.tokens,
      cardanoCalculator.addresses,
      cardanoCalculator.authToken,
      logger,
      cardanoCalculator.koiosUrl,
    );
    const bitcoinAssetCalculator = new BitcoinCalculator(
      this.tokens,
      bitcoinCalculator.addresses,
      bitcoinCalculator.esploraUrl,
      logger,
    );
    const ethereumAssetCalculator = new EvmCalculator(
      NETWORKS.ethereum.key,
      this.tokens,
      ethereumCalculator.addresses,
      ethereumCalculator.rpcUrl,
      ethereumCalculator.authToken,
      logger,
    );
    const binanceAssetCalculator = new EvmCalculator(
      NETWORKS.binance.key,
      this.tokens,
      binanceCalculator.addresses,
      binanceCalculator.rpcUrl,
      binanceCalculator.authToken,
      logger,
    );
    this.calculatorMap.set(NETWORKS.ergo.key, ergoAssetCalculator);
    this.calculatorMap.set(NETWORKS.cardano.key, cardanoAssetCalculator);
    this.calculatorMap.set(NETWORKS.bitcoin.key, bitcoinAssetCalculator);
    this.calculatorMap.set(NETWORKS.ethereum.key, ethereumAssetCalculator);
    this.calculatorMap.set(NETWORKS.binance.key, binanceAssetCalculator);
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
    residencyChain: Network,
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
    residencyChain: Network,
    chain: Network,
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
    chain: Network,
    residencyChain: Network,
  ): Promise<bigint> => {
    const calculator = this.calculatorMap.get(chain);

    if (!calculator)
      throw Error(`Chain [${chain}] is not supported in asset calculator`);

    const chainToken = this.getTokenDataForChain(token, residencyChain, chain);
    if (!chainToken) {
      this.logger.debug(`Token ${token.name} is not supported in ${chain}`);
      return 0n;
    }
    const emission =
      (await calculator.totalSupply(chainToken)) -
      (await calculator.totalBalance(chainToken));

    this.logger.debug(
      `Emitted amount of asset [${this.getTokenIdOnResidentChain(
        token,
        residencyChain,
      )}] in chain [${chain}] is [${emission}]`,
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
    residencyChain: Network,
  ) => {
    const calculator = this.calculatorMap.get(residencyChain);

    if (!calculator)
      throw Error(
        `Chain [${residencyChain}] is not supported in asset calculator`,
      );

    const lockedAmountsPerAddress =
      await calculator.getLockedAmountsPerAddress(token);

    lockedAmountsPerAddress.forEach((lockedAmountPerAddress) =>
      this.logger.debug(
        `Locked amount of asset [${this.getTokenIdOnResidentChain(
          token,
          residencyChain,
        )}] on address [${lockedAmountPerAddress.address}] is [${
          lockedAmountPerAddress.amount
        }]`,
      ),
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
      `All current stored bridge assets are ${JsonBigInt.stringify(
        allStoredBridgedAssets,
      )}`,
    );
    const allStoredLockedAssets =
      await this.lockedAssetModel.getAllStoredAssets();
    this.logger.debug(
      `All current stored locked assets are ${JsonBigInt.stringify(
        allStoredBridgedAssets,
      )}`,
    );
    const allStoredTokens = await this.tokenModel.getAllStoredTokens();
    this.logger.debug(
      `All current stored tokens are ${JsonBigInt.stringify(
        allStoredBridgedAssets,
      )}`,
    );

    const allCurrentBridgedAssets = [];
    const allCurrentLockedAssets: Partial<LockedAssetEntity>[] = [];
    const allCurrentTokens = [];

    const residencyChains = this.tokens.getAllChains() as Network[];

    for (const residencyChain of residencyChains) {
      const chainIdKey = this.tokens.getIdKey(residencyChain);

      const nativeResidentTokens =
        this.tokens.getAllNativeTokens(residencyChain);
      this.logger.debug(
        `All native resident tokens of ${residencyChain} chain are ${JsonBigInt.stringify(
          nativeResidentTokens,
        )}`,
      );

      const chains = this.tokens.getSupportedChains(
        residencyChain,
      ) as Network[];

      for (const nativeResidentToken of nativeResidentTokens) {
        this.logger.info(
          `Started calculating values for ${nativeResidentToken.name} native on chain ${residencyChain}`,
        );
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
          residencyChain,
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
              `Updated asset [${nativeResidentToken[chainIdKey]}] locked amount to [${lockedItem.amount}] for address [${lockedItem.address}]`,
            );
            this.logger.debug(
              `Updated asset details for [${JsonBigInt.stringify(
                newLockedAsset,
              )}]`,
            );
          }),
        );

        try {
          for (const chain of chains) {
            const emission = await this.calculateEmissionForChain(
              nativeResidentToken,
              chain,
              residencyChain,
            );
            this.logger.debug(
              `Asset [${nativeResidentToken[chainIdKey]}] emitted amount on chain ${chain} is [${emission}]`,
            );
            if (!emission) {
              this.logger.debug(
                `Emitted amount of asset ${nativeResidentToken.name} on ${chain} is zero. skipping bridged asset update.`,
              );
              continue;
            }

            const tokenDataOnAllChains = this.tokens.search(residencyChain, {
              [chainIdKey]: newToken.id,
            })[0];
            const bridgedTokenId = this.tokens.getID(
              tokenDataOnAllChains,
              chain,
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
              `Updated asset [${nativeResidentToken[chainIdKey]}] bridged amount on chain ${chain} to [${emission}]`,
            );
            this.logger.debug(
              `Updated bridged asset details for [${JsonBigInt.stringify(
                newBridgedAsset,
              )}]`,
            );
          }
        } catch (e) {
          this.logger.warn(
            `Skipping asset [${nativeResidentToken[chainIdKey]}] bridged amount update, error: [${e}]`,
          );
          if (e instanceof Error && e.stack)
            this.logger.debug(`Error stack trace: [${e.stack}]`);
        }
      }
    }
    const oldBridgedAssets = differenceWith(
      allStoredBridgedAssets,
      allCurrentBridgedAssets,
      isEqual,
    );
    const oldLockedAssets = differenceWith(
      allStoredLockedAssets,
      allCurrentLockedAssets,
      isEqual,
    );
    const oldTokens = difference(allStoredTokens, allCurrentTokens);
    await this.bridgedAssetModel.removeAssets(oldBridgedAssets);
    await this.lockedAssetModel.removeAssets(oldLockedAssets);
    await this.tokenModel.removeTokens(oldTokens);
  };
}

export default AssetCalculator;
