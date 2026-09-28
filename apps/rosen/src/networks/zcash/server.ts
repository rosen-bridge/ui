'use server';

import { createZcashAddressCodec } from '@rosen-bridge/address-codec-zcash';
import { type CalculateFee, calculateFeeCreator, getMinTransferCreator } from '@rosen-network/base';
import { generateOpReturnData as generateOpReturnDataCore } from '@rosen-network/firo';
import { NETWORKS } from '@rosen-ui/constants';
import type { Network } from '@rosen-ui/types';

import { wrap } from '@/safeServerAction';
import { getTokenMap } from '@/tokenMap/getServerTokenMap';

import { FEE_CONFIG_TOKEN_ID, TOKENS } from '../../../configs';
import type { ZcashNetworkName } from './address';
import { zcashRpc } from './rpc';

const getHeight = async (): Promise<number> => {
  const height = await zcashRpc<number>('getblockcount');
  if (!Number.isSafeInteger(height) || height < 0) throw new Error('Invalid Zcash node height');
  return height;
};

const calculateFeeFromExplorer: CalculateFee = calculateFeeCreator(NETWORKS.zcash.key, getHeight);

const calculateFeeCore: CalculateFee = async (...args) => {
  if (process.env.ZCASH_NETWORK !== 'regtest') return calculateFeeFromExplorer(...args);

  const bridgeFee = process.env.ZCASH_REGTEST_BRIDGE_FEE_ZAT;
  const networkFee = process.env.ZCASH_REGTEST_NETWORK_FEE_ZAT;
  const configuredGenesis = process.env.ZCASH_GENESIS_HASH;
  if (
    args[0] !== NETWORKS.ergo.key ||
    !TOKENS.some((pair) => pair.zcash?.tokenId === 'zec' && pair.ergo?.tokenId === args[1]) ||
    !/^[0-9a-f]{64}$/.test(process.env.ZCASH_REGTEST_MIN_FEE_NFT ?? '') ||
    args[3] !== FEE_CONFIG_TOKEN_ID ||
    args[3] !== process.env.ZCASH_REGTEST_MIN_FEE_NFT ||
    process.env.NEXT_PUBLIC_ZCASH_NETWORK !== 'regtest' ||
    configuredGenesis !== process.env.NEXT_PUBLIC_ZCASH_GENESIS_HASH ||
    !/^[0-9a-f]{64}$/.test(configuredGenesis ?? '') ||
    !/^[1-9][0-9]*$/.test(bridgeFee ?? '') ||
    !/^[1-9][0-9]*$/.test(networkFee ?? '')
  ) {
    throw new Error('Regtest Zcash fee quote is not configured');
  }
  if ((await zcashRpc<string>('getblockhash', [0])) !== configuredGenesis) {
    throw new Error('Zcash fee quote node is on another network');
  }
  const fees = {
    bridgeFee: BigInt(bridgeFee!),
    networkFee: BigInt(networkFee!),
    feeRatio: 0n,
    feeRatioDivisor: 1n,
    rsnRatio: 0n,
    rsnRatioDivisor: 1n,
  };
  return { fees, nextFees: fees };
};

export const calculateFee = wrap(calculateFeeCore, {
  cache: 60_000,
  traceKey: 'zcash:calculateFee',
});

export const getMinTransfer = wrap(getMinTransferCreator(NETWORKS.zcash.key, calculateFeeCore)(getTokenMap), {
  traceKey: 'zcash:getMinTransfer',
});

export const generateOpReturnData = wrap(generateOpReturnDataCore, {
  traceKey: 'zcash:generateOpReturnData',
});

const validateZcashAddress = async (chain: Network, address: string): Promise<boolean> => {
  const network = process.env.ZCASH_NETWORK as ZcashNetworkName | undefined;
  const genesis = process.env.ZCASH_GENESIS_HASH;
  if (
    chain !== NETWORKS.zcash.key ||
    !network ||
    !['mainnet', 'testnet', 'regtest'].includes(network) ||
    network !== process.env.NEXT_PUBLIC_ZCASH_NETWORK ||
    !/^[0-9a-f]{64}$/.test(genesis ?? '') ||
    genesis !== process.env.NEXT_PUBLIC_ZCASH_GENESIS_HASH
  )
    return false;
  try {
    const recipient = createZcashAddressCodec(network).parseRecipient(address);
    if ((await zcashRpc<string>('getblockhash', [0])) !== genesis) return false;
    if (recipient.kind !== 'orchard') return true;

    if (
      network !== 'regtest' ||
      process.env.ZCASH_REGTEST_NU6_2_ORCHARD_ENABLED !== 'true'
    )
      return false;
    const blockchainInfo = await zcashRpc<{ consensus?: { nextblock?: unknown } }>(
      'getblockchaininfo',
    );
    return blockchainInfo.consensus?.nextblock === '5437f330';
  } catch {
    return false;
  }
};

export const validateAddress = wrap(validateZcashAddress, {
  traceKey: 'zcash:validateAddress',
});
