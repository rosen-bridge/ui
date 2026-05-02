import { CallbackType } from '@rosen-bridge/abstract-extractor';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { ErgoUTXOExtractor } from '@rosen-bridge/address-extractor';
import { ErgoScanner } from '@rosen-bridge/ergo-scanner';
import { ExtendedTokenMap, TokenMap } from '@rosen-bridge/extended-tokens';
import {
  Dependency,
  ServiceAction,
  ServiceStatus,
} from '@rosen-bridge/service-manager';
import { createClient, VercelKV } from '@vercel/kv';
import 'constants';
import crypto from 'crypto';
import * as ergoLib from 'ergo-lib-wasm-nodejs';
import fs from 'node:fs';
import path from 'node:path';

import { configs } from '../configs';
import {
  TOKEN_MAP_EXTRACTOR_LOGGER_NAME,
  TOKEN_MAP_EXTRACTOR_ID,
  TOKEN_MAP_REDIS_KEY,
} from '../constants';
import { resolveErgoNetworkConfig } from '../utils';
import { DBService } from './db';
import { AbstractErgoScannerService } from './types/abstractErgoScanner';
import { AbstractTokenMapService } from './types/abstractTokenMapService';
import { AbstractDBService } from './types/abstrctDb';

export class TokenMapService extends AbstractTokenMapService {
  name = AbstractTokenMapService.Name;
  tokenMap: TokenMap;
  private ergoScanner: ErgoScanner;
  protected dependencies: Dependency[] = [
    {
      serviceName: AbstractDBService.Name,
      allowedStatuses: [ServiceStatus.running],
      action: ServiceAction.start,
    },
    {
      serviceName: AbstractErgoScannerService.Name,
      allowedStatuses: [
        ServiceStatus.running,
        ServiceStatus.dormant,
        ServiceStatus.started,
      ],
      action: ServiceAction.assemble,
    },
  ];

  assemble = async (): Promise<boolean> => {
    this.ergoScanner =
      AbstractErgoScannerService.getInstance().getErgoScanner();
    this.tokenMap = new TokenMap();
    this.setStatus(ServiceStatus.dormant);
    return true;
  };
  /**
   * constructor for tokenMap service
   * @param {ErgoScanner} ergoScanner Scanner instance to register extractors.
   * @param {AbstractLogger} logger.
   */
  private constructor(logger: AbstractLogger = new DummyLogger()) {
    super(logger);
  }

  /**
   * initializes the singleton instance of TokenMapService
   *
   * @static
   * @param {ErgoScanner} ergoScanner
   * @param {AbstractLogger} [logger]
   * @memberof TokenMapService
   */
  static init = (logger?: AbstractLogger) => {
    if (AbstractTokenMapService.instance != undefined) {
      return;
    }
    AbstractTokenMapService.instance = new TokenMapService(logger);
  };

  /**
   * Start service by loading token map from file or initializes on-chain token map depending on config.
   * @returns {Promise<boolean>} True if the service started successfully, false otherwise.
   */
  protected start = async (): Promise<boolean> => {
    this.setStatus(ServiceStatus.started);
    if (!configs.tokenMap.onChainTokenMapEnabled) {
      await this.loadFromFile();
    } else {
      await this.initOnChain();
    }
    this.setStatus(ServiceStatus.running);
    return true;
  };

  /**
   * Stops the service and sets it to dormant.
   * @returns {Promise<boolean>} True if the service stopped successfully.
   */
  protected stop = async (): Promise<boolean> => {
    this.setStatus(ServiceStatus.dormant);
    return true;
  };

  /**
   * Loads token map from a local JSON file.
   * @throws {Error} If the token map file does not exist.
   */
  private async loadFromFile() {
    const tokensPath = path.resolve(configs.tokenMap.path!);
    if (!fs.existsSync(tokensPath)) {
      throw new Error(`TokenMap file ${tokensPath} does not exist`);
    }
    const tokensJson: string = fs.readFileSync(tokensPath, 'utf8');
    const tokens = JSON.parse(tokensJson);
    await this.tokenMap.updateConfigByJson(tokens.tokens);
    this.logger.debug(`TokenMap loaded from ${tokensPath}`);
  }

  /**
   * Initializes the token map from on-chain data.
   */
  private async initOnChain() {
    if (
      !configs.contracts.ergo.addresses.tokenMap ||
      !configs.contracts.ergo.tokens.tokenMap
    ) {
      throw new Error('On-chain token map address or token not defined');
    }
    const { networkType, url } = resolveErgoNetworkConfig();
    const tokenMapBoxExtractor = new ErgoUTXOExtractor(
      AbstractDBService.getInstance().getDataSource(),
      TOKEN_MAP_EXTRACTOR_ID,
      ergoLib.NetworkPrefix.Mainnet,
      url,
      networkType,
      configs.contracts.ergo.addresses.tokenMap,
      [configs.contracts.ergo.tokens.tokenMap],
      this.logger.child(TOKEN_MAP_EXTRACTOR_LOGGER_NAME),
    );

    await this.ergoScanner.registerExtractor(tokenMapBoxExtractor);

    this.tokenMap = new ExtendedTokenMap();

    const redis = createClient({
      url: configs.redis.address,
      token: configs.redis.token,
    });

    const updateTokenMapWrapper = async () =>
      await this.updateTokenMap(this.tokenMap as ExtendedTokenMap, redis);

    [
      CallbackType.Insert,
      CallbackType.Update,
      CallbackType.Spend,
      CallbackType.Delete,
    ].forEach((type) => tokenMapBoxExtractor.hook(type, updateTokenMapWrapper));

    this.logger.info('On-chain TokenMap initialized and extractor registered');
  }

  /**
   * Updates the token map from DBService data and stores it in Redis.
   * @param {ExtendedTokenMap} tokenMap Token map instance to update.
   * @param {VercelKV} redis Redis client to store updated token map.
   */
  private updateTokenMap = async (
    tokenMap: ExtendedTokenMap,
    redis: VercelKV,
  ) => {
    const boxes = await DBService.getInstance().getTokenMapBoxes();
    await tokenMap.updateConfigByBoxes(boxes.map((box) => box.serialized));

    const tokenMapJSON = JSON.stringify(tokenMap.getConfig());
    const tokenMapHash = crypto.hash('sha256', tokenMapJSON);

    await redis.set(TOKEN_MAP_REDIS_KEY, {
      hash: tokenMapHash,
      tokenMap: tokenMap.getConfig(),
    });
  };

  /**
   * returns of tokenMap
   *
   * @returns {TokenMap} tokenMap
   */
  getTokenMap = (): TokenMap => {
    return this.tokenMap;
  };
}
