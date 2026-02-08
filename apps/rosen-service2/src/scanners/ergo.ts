import { CallbackType } from '@rosen-bridge/abstract-extractor';
import {
  FailoverStrategy,
  NetworkConnectorManager,
} from '@rosen-bridge/abstract-scanner';
import { ErgoUTXOExtractor } from '@rosen-bridge/address-extractor';
import { CallbackLoggerFactory } from '@rosen-bridge/callback-logger';
import { ErgoObservationExtractor } from '@rosen-bridge/ergo-observation-extractor';
import {
  ErgoExplorerNetwork,
  ErgoNodeNetwork,
  ErgoScanner,
} from '@rosen-bridge/ergo-scanner';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { ErgoNetworkType, Transaction } from '@rosen-bridge/scanner-interfaces';
import { TokenMap } from '@rosen-bridge/tokens';
import { EventTriggerExtractor } from '@rosen-bridge/watcher-data-extractor';
import { NETWORKS } from '@rosen-ui/constants';
import { createClient, VercelKV } from '@vercel/kv';
import crypto from 'crypto';
import * as ergoLib from 'ergo-lib-wasm-nodejs';

import { configs } from '../configs';
import {
  ERGO_METHOD_EXPLORER,
  TOKEN_MAP_EXTRACTOR_ID,
  TOKEN_MAP_REDIS_KEY,
} from '../constants';
import { DBService } from '../services/db';
import { TokensConfig } from '../tokensConfig';
import { ChainConfigs } from '../types';

const logger = CallbackLoggerFactory.getInstance().getLogger(import.meta.url);

/**
 * create an event trigger extractor
 * @param chain
 * @param networkType
 * @param url
 * @param dataSource
 * @param chianConfigs
 * @returns EventTriggerExtractor
 */
const createEventTrigger = (
  chain: string,
  networkType: ErgoNetworkType,
  url: string,
  dataSource: DataSource,
  chianConfigs: ChainConfigs,
) => {
  return new EventTriggerExtractor(
    `${chain}-extractor`,
    dataSource,
    networkType,
    url,
    chianConfigs.addresses.WatcherTriggerEvent,
    chianConfigs.tokens.RWTId,
    chianConfigs.addresses.WatcherPermit,
    chianConfigs.addresses.Fraud,
    CallbackLoggerFactory.getInstance().getLogger(
      `${chain}-event-trigger-extractor`,
    ),
  );
};

/**
 * Initializes and configures an Ergo scanner instance.
 *
 * @param dataSource - TypeORM DataSource for DB connection
 * @returns Configured and ready-to-use ErgoScanner instance
 * @throws Error if observation extractor creation or registration fails
 */
export const initializeErgoScanner = async (dataSource: DataSource) => {
  logger.info('Starting Ergo scanner initialization...');

  // Create Ergo scanner with Explorer network settings
  const networkConnectorManager = new NetworkConnectorManager<Transaction>(
    new FailoverStrategy(),
    logger,
  );
  if (configs.chains.ergo.method == ERGO_METHOD_EXPLORER) {
    configs.chains.ergo.explorer.connections.forEach((explorer) => {
      networkConnectorManager.addConnector(
        new ErgoExplorerNetwork(explorer.url!),
      );
    });
  } else {
    configs.chains.ergo.node.connections.forEach((node) => {
      networkConnectorManager.addConnector(new ErgoNodeNetwork(node.url!));
    });
  }
  const ergoScanner = new ErgoScanner({
    dataSource: dataSource,
    initialHeight: configs.chains.ergo.initialHeight,
    network: networkConnectorManager,
    blockRetrieveGap: configs.chains.ergo.blockRetrieveGap,
    logger: logger,
  });

  const ergoObservationExtractor = new ErgoObservationExtractor(
    configs.contracts.ergo.addresses.lock,
    dataSource,
    TokensConfig.getInstance().getTokenMap(),
    logger,
  );
  await ergoScanner.registerExtractor(ergoObservationExtractor);

  let networkType: ErgoNetworkType;
  let url: string;
  if (configs.chains.ergo.method == ERGO_METHOD_EXPLORER) {
    networkType = ErgoNetworkType.Explorer;
    url = configs.chains.ergo.explorer.connections[0].url!;
  } else {
    networkType = ErgoNetworkType.Node;
    url = configs.chains.ergo.node.connections[0].url!;
  }

  try {
    const ergoEventTriggerExtractor = createEventTrigger(
      NETWORKS.ergo.key,
      networkType,
      url,
      dataSource,
      configs.contracts.ergo,
    );
    await ergoScanner.registerExtractor(ergoEventTriggerExtractor);
    if (configs.chains.cardano.active)
      await ergoScanner.registerExtractor(
        createEventTrigger(
          NETWORKS.cardano.key,
          networkType,
          url,
          dataSource,
          configs.contracts.cardano,
        ),
      );
    if (configs.chains.bitcoin.active)
      await ergoScanner.registerExtractor(
        createEventTrigger(
          NETWORKS.binance.key,
          networkType,
          url,
          dataSource,
          configs.contracts.bitcoin,
        ),
      );
    if (configs.chains.doge.active)
      await ergoScanner.registerExtractor(
        createEventTrigger(
          NETWORKS.doge.key,
          networkType,
          url,
          dataSource,
          configs.contracts.doge,
        ),
      );
    if (configs.chains.ethereum.active)
      await ergoScanner.registerExtractor(
        createEventTrigger(
          NETWORKS.ethereum.key,
          networkType,
          url,
          dataSource,
          configs.contracts.ethereum,
        ),
      );
    if (configs.chains.binance.active)
      await ergoScanner.registerExtractor(
        createEventTrigger(
          NETWORKS.binance.key,
          networkType,
          url,
          dataSource,
          configs.contracts.binance,
        ),
      );
  } catch (error) {
    throw new Error(
      `cannot create or register event trigger extractors due to error: ${error}`,
    );
  }

  try {
    if (!configs.contracts.ergo.addresses.tokenMap) {
      throw new Error(`on-chain-token-map address in not defined`);
    }
    if (!configs.contracts.ergo.tokens.tokenMap) {
      throw new Error(`on-chain-token-map token in not defined`);
    }

    const tokenMapBoxExtractor = new ErgoUTXOExtractor(
      dataSource,
      TOKEN_MAP_EXTRACTOR_ID,
      ergoLib.NetworkPrefix.Mainnet,
      url,
      networkType,
      configs.contracts.ergo.addresses.tokenMap,
      [configs.contracts.ergo.tokens.tokenMap],
      CallbackLoggerFactory.getInstance().getLogger(TOKEN_MAP_EXTRACTOR_ID),
    );
    await ergoScanner.registerExtractor(tokenMapBoxExtractor);

    const tokenMap = new TokenMap();

    const redis = createClient({
      url: configs.redis.address,
      token: configs.redis.token,
    });

    const updateTokenMapWrapper = async () =>
      await updateTokenMap(tokenMap, redis);

    tokenMapBoxExtractor.hook(CallbackType.Insert, updateTokenMapWrapper);
    tokenMapBoxExtractor.hook(CallbackType.Update, updateTokenMapWrapper);
    tokenMapBoxExtractor.hook(CallbackType.Spend, updateTokenMapWrapper);
    tokenMapBoxExtractor.hook(CallbackType.Delete, updateTokenMapWrapper);
  } catch (error) {
    throw new Error(
      `cannot create or register token map box extractor due to error: ${error}`,
    );
  }

  logger.info('Ergo scanner initialization completed successfully');
  return ergoScanner;
};

/**
 * updates the tokenMap using
 * @param tokenMap
 * @param redis
 */
const updateTokenMap = async (tokenMap: TokenMap, redis: VercelKV) => {
  const boxes = await DBService.getInstance().getTokenMapBoxes();

  await tokenMap.updateConfigByBoxes(boxes.map((box) => box.serialized));

  const tokenMapJSON = JSON.stringify(tokenMap.getConfig());
  const tokenMapHash = crypto.hash('sha256', tokenMapJSON);

  await redis.set(TOKEN_MAP_REDIS_KEY, {
    hash: tokenMapHash,
    tokenMap: tokenMap.getConfig(),
  });
};
