import { DefaultLogger } from '@rosen-bridge/abstract-logger';
import { FailoverStrategy, NetworkConnectorManager } from '@rosen-bridge/abstract-scanner';
import type { TokenMap } from '@rosen-bridge/extended-tokens';
import type { DataSource } from '@rosen-bridge/extended-typeorm';
import { NativeZcashInspector } from '@rosen-bridge/rosen-extractor';
import { ZcashObservationExtractor } from '@rosen-bridge/zcash-observation-extractor';
import {
  FailClosedScannerLogger,
  ZcashRpcNetwork,
  ZcashRpcScanner,
  type ZcashRpcTransaction,
} from '@rosen-bridge/zcash-scanner';

import { configs } from '../configs';

const logger = DefaultLogger.getInstance().child(import.meta.url);
const BRANCH_ID = /^[0-9a-f]{8}$/;

export const getZcashScanner = async (dataSource: DataSource, tokenMap: TokenMap) => {
  const config = configs.chains.zcash;
  if (
    !config.rpc.url ||
    !config.genesisHash ||
    !config.inspector?.path ||
    !config.inspector?.sha256
  ) {
    throw new Error('Active Zcash scanner requires RPC, genesis and native inspector settings');
  }
  if (!config.branches?.length || config.branches[0].height !== 0) {
    throw new Error('Zcash branch schedule must start at height zero');
  }
  for (let i = 0; i < config.branches.length; i++) {
    const branch = config.branches[i];
    if (
      !Number.isSafeInteger(branch.height) ||
      branch.height < 0 ||
      !BRANCH_ID.test(branch.branchId) ||
      (i > 0 && branch.height <= config.branches[i - 1].height)
    ) {
      throw new Error('Invalid Zcash branch schedule');
    }
  }

  const network = new NetworkConnectorManager<ZcashRpcTransaction>(
    new FailoverStrategy(),
    logger.child('zcashRpcNetwork'),
  );
  network.addConnector(
    new ZcashRpcNetwork({
      rpcUrl: config.rpc.url,
      expectedGenesisHash: config.genesisHash,
      timeoutMs: (config.rpc.timeout ?? 30) * 1000,
      auth:
        config.rpc.username && config.rpc.password
          ? { username: config.rpc.username, password: config.rpc.password }
          : undefined,
    }),
  );

  // GeneralScanner reports update errors to its logger without rethrowing.
  const errorLogger = new FailClosedScannerLogger();
  const scanner = new ZcashRpcScanner({
    dataSource,
    initialHeight: config.initialHeight,
    network,
    logger: errorLogger,
  });
  const extractor = new ZcashObservationExtractor(dataSource, {
    network: config.network,
    lockAddress: configs.contracts.zcash.addresses.lock,
    tokens: tokenMap,
    inspector: new NativeZcashInspector({
      executablePath: config.inspector.path,
      expectedSha256: config.inspector.sha256,
    }),
    branchIdAtHeight: (height: number) => {
      const branch = config.branches.findLast((entry) => entry.height <= height);
      if (!branch) throw new Error('Zcash branch schedule does not cover block height');
      return branch.branchId;
    },
    logger: errorLogger,
    storeRawData: true,
  });
  await scanner.registerExtractor(extractor);
  return { scanner, errorLogger };
};
