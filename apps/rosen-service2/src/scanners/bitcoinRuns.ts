import { DefaultLogger } from '@rosen-bridge/abstract-logger';
import {
  FailoverStrategy,
  NetworkConnectorManager,
} from '@rosen-bridge/abstract-scanner';
import {
  BitcoinRunesRpcObservationExtractor,
  BitcoinRunesEsploraObservationExtractor,
  UnisatRunesProtocolNetwork,
  AbstractRunesProtocolNetwork,
} from '@rosen-bridge/bitcoin-runes-observation-extractor';
import {
  BitcoinRpcNetwork,
  BitcoinRpcScanner,
  BitcoinEsploraScanner,
  EsploraNetwork,
  BitcoinRpcTransaction,
  BitcoinEsploraTransaction,
} from '@rosen-bridge/bitcoin-scanner';
import { DataSource } from '@rosen-bridge/extended-typeorm';

import { configs } from '../configs';
import { TokensConfig } from '../tokensConfig';

const logger = DefaultLogger.getInstance().child(import.meta.url);

export const buildBitcoinRunesRpcScannerWithExtractors = async (
  dataSource: DataSource,
) => {
  logger.info('Starting Bitcoin Runes RPC scanner initialization...');

  const networkConnectorManager =
    new NetworkConnectorManager<BitcoinRpcTransaction>(
      new FailoverStrategy(),
      logger.child('bitcoinRunesRpcScannerLogger'),
    );

  configs.chains.bitcoin.rpc.connections.forEach((rpc) => {
    networkConnectorManager.addConnector(
      new BitcoinRpcNetwork(
        rpc.url!,
        rpc.timeout! * 1000,
        rpc.username && rpc.password
          ? { username: rpc.username, password: rpc.password }
          : undefined,
      ),
    );
  });

  const bitcoinScanner = new BitcoinRpcScanner({
    dataSource,
    initialHeight: configs.chains.bitcoin.initialHeight,
    network: networkConnectorManager,
    blockRetrieveGap: configs.chains.bitcoin.blockRetrieveGap,
    logger: logger.child('bitcoinRunesRpcScannerLogger'),
  });

  try {
    const tokenMap = TokensConfig.getInstance().getTokenMap();

    let runesClient: AbstractRunesProtocolNetwork;

    runesClient = new UnisatRunesProtocolNetwork(
      configs.chains.bitcoinRuns.unisatUrl,
      configs.chains.bitcoinRuns.unisatApiKey!,
      logger.child('runesClient'),
    );

    logger.debug('Creating Bitcoin Runes RPC observation extractor...');

    const observationExtractor = new BitcoinRunesRpcObservationExtractor(
      configs.contracts.bitcoin.addresses.lock,
      runesClient,
      dataSource,
      tokenMap,
      logger.child('bitcoinRunesRpcObservationExtractor'),
    );

    await bitcoinScanner.registerExtractor(observationExtractor);

    logger.info(
      'Bitcoin Runes RPC observation extractor registered successfully',
    );
  } catch (error) {
    logger.error(
      `Failed to create/register Bitcoin Runes RPC extractor: ${
        error instanceof Error ? error.message : error
      }`,
    );
  }

  logger.info(
    'Bitcoin Runes RPC scanner initialization completed successfully',
  );
  return bitcoinScanner;
};

export const buildBitcoinRunesEsploraScannerWithExtractors = async (
  dataSource: DataSource,
) => {
  logger.info('Starting Bitcoin Runes Esplora scanner initialization...');

  const networkConnectorManager =
    new NetworkConnectorManager<BitcoinEsploraTransaction>(
      new FailoverStrategy(),
      logger.child('bitcoinRunesEsploraScannerLogger'),
    );

  configs.chains.bitcoin.esplora.connections.forEach((esplora) => {
    networkConnectorManager.addConnector(
      new EsploraNetwork(
        esplora.url!,
        esplora.timeout! * 1000,
        esplora.apiPrefix,
      ),
    );
  });

  const bitcoinScanner = new BitcoinEsploraScanner({
    dataSource,
    initialHeight: configs.chains.bitcoin.initialHeight,
    network: networkConnectorManager,
    blockRetrieveGap: configs.chains.bitcoin.blockRetrieveGap,
    logger: logger.child('bitcoinRunesEsploraScannerLogger'),
  });

  try {
    const tokenMap = TokensConfig.getInstance().getTokenMap();

    let runesClient: AbstractRunesProtocolNetwork;
    runesClient = new UnisatRunesProtocolNetwork(
      configs.chains.bitcoinRuns.unisatUrl,
      configs.chains.bitcoinRuns.unisatApiKey!,
      logger.child('runesClient'),
    );

    logger.debug('Creating Bitcoin Runes Esplora observation extractor...');

    const observationExtractor = new BitcoinRunesEsploraObservationExtractor(
      configs.contracts.bitcoin.addresses.lock,
      runesClient,
      dataSource,
      tokenMap,
      logger.child('bitcoinRunesEsploraObservationExtractor'),
    );

    await bitcoinScanner.registerExtractor(observationExtractor);

    logger.info(
      'Bitcoin Runes Esplora observation extractor registered successfully',
    );
  } catch (error) {
    logger.error(
      `Failed to create/register Bitcoin Runes Esplora extractor: ${
        error instanceof Error ? error.message : error
      }`,
    );
  }

  logger.info(
    'Bitcoin Runes Esplora scanner initialization completed successfully',
  );
  return bitcoinScanner;
};
