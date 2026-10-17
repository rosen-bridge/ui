import type { TokenMap } from '@rosen-bridge/tokens';
import { type CalculateFee, calculateFeeCreator, validateAddress } from '@rosen-network/base';
import type { Network } from '@rosen-ui/types';

import { type BitcoinCashServerConfig, parseBitcoinCashServerConfig } from '../config.js';
import { createBitcoinCashElectrumProvider } from './bitcoinCashElectrumProvider.js';
import { createBitcoinCashElectrumSubmitter } from './bitcoinCashElectrumSubmitter.js';
import { createBitcoinCashBridgeActions } from './bridgeActions.js';
import { createBitcoinCashTransferLimits } from './transferLimits.js';

/** Construct real server readers, trusted quote queries and submission without opening a connection. */
export const createBitcoinCashServerRuntime = (
  configuration: Readonly<BitcoinCashServerConfig>,
  getTokenMap: () => Promise<TokenMap>,
) => {
  const config = parseBitcoinCashServerConfig(configuration.public, {
    ...configuration.electrum,
    feeRate: configuration.policy.feeRate,
    maxFeeSatoshis: configuration.policy.maxFee.toString(),
    allowedDestinationChains: configuration.policy.allowedDestinationChains,
    minimumFeeNFT: configuration.minimumFeeNFT,
  });
  if (!config || config.policy.lockAddress !== configuration.policy.lockAddress)
    throw new Error('Invalid BCH server configuration');
  const reader = createBitcoinCashElectrumProvider(config.electrum);
  const submitter = createBitcoinCashElectrumSubmitter(config.electrum, config.policy);
  const queryFee = calculateFeeCreator('bitcoin-cash', reader.getHeight);

  /** Resolve the supplied token against server-owned mapping and reject arbitrary NFT/interval queries. */
  const calculateFee: CalculateFee = async (target, tokenId, interval, requestedNFT) => {
    if (
      !config.policy.allowedDestinationChains.includes(target) ||
      requestedNFT !== config.minimumFeeNFT ||
      (interval !== 0 && interval !== config.public.nextHeightInterval)
    )
      throw new Error('Invalid BCH fee query');
    const mapping = (await getTokenMap()).getTokenSet('bch');
    const native = mapping?.['bitcoin-cash'];
    const trustedId = mapping?.ergo?.tokenId;
    if (
      native?.tokenId !== 'bch' ||
      native.type !== 'native' ||
      native.decimals !== 8 ||
      !mapping?.[target] ||
      typeof trustedId !== 'string' ||
      !/^[0-9a-f]{64}$/.test(trustedId) ||
      tokenId !== trustedId
    )
      throw new Error('Missing BCH fee mapping');
    return queryFee(target, trustedId, interval, config.minimumFeeNFT);
  };

  const ports = {
    policy: config.policy,
    minimumFeeNFT: config.minimumFeeNFT,
    nextHeightInterval: config.public.nextHeightInterval,
    getTokenMap,
    calculateFee,
    reader,
    submitter,
  };
  const actions = createBitcoinCashBridgeActions(ports);
  const limits = createBitcoinCashTransferLimits(ports);

  /** Read only authenticated native satoshis through the configured TLS provider. */
  const getAddressBalance = async (address: string): Promise<bigint> => {
    const assets = await reader.getAddressAssets(address);
    return assets.nativeToken;
  };

  const validateBitcoinCashAddress = (chain: Network, address: string): Promise<boolean> =>
    chain === 'bitcoin-cash' ? validateAddress(chain, address) : Promise.resolve(false);

  return Object.freeze({
    ...actions,
    ...limits,
    calculateFee,
    getAddressBalance,
    validateAddress: validateBitcoinCashAddress,
  });
};
