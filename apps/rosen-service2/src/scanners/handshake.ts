import { DefaultLogger } from '@rosen-bridge/abstract-logger';
import { FailoverStrategy, NetworkConnectorManager } from '@rosen-bridge/abstract-scanner';
import type { TokenMap } from '@rosen-bridge/extended-tokens';
import type { DataSource } from '@rosen-bridge/extended-typeorm';
import { HandshakeRpcObservationExtractor } from '@rosen-bridge/handshake-observation-extractor';
import {
  HandshakeRpcNetwork,
  HandshakeRpcScanner,
  type HandshakeRpcTransaction,
} from '@rosen-bridge/handshake-scanner';

import { configs } from '../configs';

const logger = DefaultLogger.getInstance().child(import.meta.url);

/**
 * Creates and configures a Handshake network connector manager.
 *
 * @returns Configured Handshake network connector manager
 */
export const createHandshakeNetworkConnectorManager = () => {
  const networkConnectorManager = new NetworkConnectorManager<HandshakeRpcTransaction>(
    new FailoverStrategy(),
    logger.child('handshakeNetworkConnector'),
  );
  configs.chains.handshake.rpc.connections.forEach((rpc) => {
    if (rpc.url && rpc.timeout) {
      networkConnectorManager.addConnector(
        new HandshakeRpcNetwork(
          rpc.url,
          rpc.timeout * 1000,
          rpc.username && rpc.password
            ? {
                username: rpc.username,
                password: rpc.password,
              }
            : undefined,
        ),
      );
    }
  });

  return networkConnectorManager;
};

/**
 * Creates and configures a Handshake scanner instance.
 *
 * @param dataSource - TypeORM DataSource for DB connection
 * @param tokenMap
 * @returns Configured and ready-to-use HandshakeScanner instance
 * @throws Error if observation extractor creation or registration fails
 */
export const getHandshakeScanner = async (dataSource: DataSource, tokenMap: TokenMap) => {
  logger.info('Starting Handshake scanner initialization...');

  const handshakeScanner = new HandshakeRpcScanner({
    dataSource,
    initialHeight: configs.chains.handshake.initialHeight ?? 1,
    network: createHandshakeNetworkConnectorManager(),
    blockRetrieveGap: configs.chains.handshake.blockRetrieveGap,
    blockCleanupConfig: { active: configs.chains.handshake.blockCleanupActive === true },
    logger: logger.child('handshakeScannerLogger'),
  });

  try {
    logger.debug('Creating Handshake observation extractor...');
    const observationExtractor = new HandshakeRpcObservationExtractor(
      configs.contracts.handshake.addresses.lock,
      dataSource,
      tokenMap,
      logger.child('handshakeObservationExtractor'),
    );

    logger.debug('Registering observation extractor with scanner...');
    await handshakeScanner.registerExtractor(observationExtractor);
    logger.info('Handshake observation extractor registered successfully');
  } catch (error) {
    logger.error(
      `Failed to create or register Handshake observation extractor: ${error instanceof Error ? error.message : error}`,
    );
    if (error instanceof Error && error.stack) {
      logger.debug(error.stack);
    }
  }
  logger.info('Handshake scanner initialization completed successfully');
  return handshakeScanner;
};
