import { type RosenChainToken, TokenMap } from '@rosen-bridge/tokens';
import type { NetworkMaxTransferParams } from '@rosen-network/base';
import type { Network } from '@rosen-ui/types';

import {
  generateBitcoinCashLockFee,
  generateBitcoinCashLockMetadata,
  generateBitcoinCashUnsignedLock,
} from '../index.js';
import { isBitcoinCashRouteAvailable } from '../registry.js';
import type { BitcoinCashBridgeActionConfig } from './bridgeActions.js';

/** Current native transfer limits use the same trusted policy, mapping and minimum-fee query as preparation. */
export type BitcoinCashTransferLimitConfig = Pick<
  BitcoinCashBridgeActionConfig,
  'policy' | 'minimumFeeNFT' | 'getTokenMap' | 'calculateFee' | 'reader'
>;

/** Create native limits with shared amount conversion and the BCH P2PKH fee estimator. */
export const createBitcoinCashTransferLimits = (configuration: BitcoinCashTransferLimitConfig) => {
  if (!isBitcoinCashRouteAvailable('bitcoin-cash'))
    throw new Error('BCH chain index is unassigned');
  if (
    !/^[0-9a-f]{64}$/.test(configuration.minimumFeeNFT) ||
    !Number.isSafeInteger(configuration.policy.feeRate) ||
    configuration.policy.feeRate < 1 ||
    typeof configuration.policy.maxFee !== 'bigint' ||
    configuration.policy.maxFee < 1n ||
    configuration.policy.maxFee > 2_100_000_000_000_000n ||
    !Array.isArray(configuration.policy.allowedDestinationChains) ||
    configuration.policy.allowedDestinationChains.length < 1 ||
    configuration.policy.allowedDestinationChains.some(
      (chain) => !isBitcoinCashRouteAvailable(chain),
    )
  )
    throw new Error('Invalid BCH transfer limit policy');
  const policy = Object.freeze({
    ...configuration.policy,
    allowedDestinationChains: Object.freeze([...configuration.policy.allowedDestinationChains]),
  });
  const minimumFeeNFT = configuration.minimumFeeNFT;

  /** Resolve native mapping and trusted current quote, validating all math inputs before use. */
  const context = async (target: Network) => {
    if (!policy.allowedDestinationChains.includes(target) || !/^[0-9a-f]{64}$/.test(minimumFeeNFT))
      throw new Error('Invalid BCH transfer limit route');
    const shared = await configuration.getTokenMap();
    const receivedMapping = shared.getTokenSet('bch');
    if (!receivedMapping) throw new Error('Missing BCH transfer limit mapping');
    const entries = Object.entries(receivedMapping);
    if (entries.length < 1 || entries.length > 64)
      throw new Error('Invalid BCH transfer limit mapping');
    // Every chain contributes to TokenMap's minimum decimals, even outside this route.
    // Copy before any await: OCTM updates the shared TokenMap in place.
    const mapping: Record<string, RosenChainToken> = {};
    for (const [chain, token] of entries) {
      if (
        !/^[a-z][a-z0-9-]{0,63}$/.test(chain) ||
        !Number.isSafeInteger(token.decimals) ||
        token.decimals < 0 ||
        token.decimals > 255 ||
        [token.tokenId, token.name, token.type, token.residency].some(
          (value) => typeof value !== 'string' || value.length > 1024,
        )
      )
        throw new Error('Invalid BCH transfer limit mapping');
      mapping[chain] = {
        tokenId: token.tokenId,
        name: token.name,
        decimals: token.decimals,
        type: token.type,
        residency: token.residency,
        extra: {},
      };
    }
    const native = mapping?.['bitcoin-cash'];
    const ergoId = mapping?.ergo?.tokenId;
    if (
      native?.tokenId !== 'bch' ||
      native.type !== 'native' ||
      native.decimals !== 8 ||
      !mapping?.[target] ||
      typeof ergoId !== 'string' ||
      !/^[0-9a-f]{64}$/.test(ergoId)
    )
      throw new Error('Missing BCH transfer limit mapping');
    const map = new TokenMap();
    await map.updateConfigByJson([mapping]);
    const { fees } = await configuration.calculateFee(target, ergoId, 0, minimumFeeNFT);
    const values = {
      bridgeFee: fees.bridgeFee,
      networkFee: fees.networkFee,
      feeRatio: fees.feeRatio,
      feeRatioDivisor: fees.feeRatioDivisor,
    };
    for (const value of Object.values(values))
      if (typeof value !== 'bigint' || value < 0n || value > 0xffffffffffffffffn)
        throw new Error('Invalid BCH transfer limit quote');
    if (values.feeRatioDivisor === 0n || values.feeRatio >= values.feeRatioDivisor)
      throw new Error('BCH quote has no viable native deposit');
    return { map, fees: Object.freeze(values) };
  };

  /** Find the smallest wrapped deposit covering fixed/proportional fees and the native treasury dust floor. */
  const getMinTransfer = async (
    token: RosenChainToken,
    target: Network,
    requestedNFT: string,
  ): Promise<bigint> => {
    const identity = { tokenId: token.tokenId, type: token.type, decimals: token.decimals };
    if (
      identity.tokenId !== 'bch' ||
      identity.type !== 'native' ||
      identity.decimals !== 8 ||
      requestedNFT !== minimumFeeNFT
    )
      throw new Error('Invalid BCH native minimum-transfer request');
    const { map, fees } = await context(target);
    const fixed = fees.bridgeFee + fees.networkFee + 1n;
    // W > floor(W*r/d)+N is equivalent to W*(d-r) > N*d.
    const proportional =
      (fees.networkFee * fees.feeRatioDivisor) / (fees.feeRatioDivisor - fees.feeRatio) + 1n;
    const dust = map.wrapAmount('bch', 546n, 'bitcoin-cash').amount;
    const minimum = [fixed, proportional, dust].reduce((largest, value) =>
      value > largest ? value : largest,
    );
    const raw = map.unwrapAmount('bch', minimum, 'bitcoin-cash').amount;
    if (raw < 546n || raw > 2_100_000_000_000_000n)
      throw new Error('BCH minimum exceeds native deposit bounds');
    return minimum;
  };

  /** Maximize an authenticated prefix of at most 100 native inputs, then round the deposit down to wrapped units. */
  const getMaxTransfer = async (parameters: NetworkMaxTransferParams): Promise<bigint> => {
    const original = Object.freeze({
      balance: parameters.balance,
      isNative: parameters.isNative,
      toChain: parameters.eventData.toChain,
      fromAddress: parameters.eventData.fromAddress,
      toAddress: parameters.eventData.toAddress,
    });
    if (!original.isNative || original.balance <= 0n || !original.toAddress) return 0n;
    if (typeof original.balance !== 'bigint' || original.balance > 2_100_000_000_000_000n)
      throw new Error('Invalid BCH wrapped balance');
    const route = { toChain: original.toChain, toAddress: original.toAddress };
    generateBitcoinCashLockMetadata({ ...route, bridgeFee: 0n, networkFee: 0n });
    const { map, fees } = await context(original.toChain);
    const received = await configuration.reader.getSpendableUtxos(original.fromAddress);
    if (!Array.isArray(received) || received.length > 1000)
      throw new Error('Invalid BCH UTXO limit snapshot');
    let characters = 0;
    const snapshot = received
      .map((utxo) => {
        if (
          typeof utxo.value !== 'bigint' ||
          utxo.value <= 0n ||
          utxo.value > 2_100_000_000_000_000n ||
          typeof utxo.parentTransactionHex !== 'string'
        )
          throw new Error('Invalid BCH UTXO limit snapshot');
        characters += utxo.parentTransactionHex.length;
        if (characters > 4_000_000) throw new Error('Invalid BCH UTXO limit snapshot');
        return Object.freeze({ ...utxo });
      })
      .sort((first, second) =>
        first.value === second.value
          ? first.txId.localeCompare(second.txId)
          : first.value > second.value
            ? -1
            : 1,
      );
    const candidates = snapshot.slice(0, 100);
    let sum = 0n;
    let best = 0n;
    let count = 0;
    for (let index = 0; index < candidates.length; index++) {
      sum += candidates[index].value;
      if (sum > 2_100_000_000_000_000n) throw new Error('Invalid BCH UTXO aggregate');
      const fee = generateBitcoinCashLockFee({
        ...route,
        bridgeFee: 0n,
        networkFee: 0n,
        inputCount: index + 1,
        feeRate: policy.feeRate,
      });
      const available = sum - fee - 546n;
      if (fee <= policy.maxFee && available > best) {
        best = available;
        count = index + 1;
      }
    }
    if (best < 546n) return 0n;
    const callerCap = map.unwrapAmount('bch', original.balance, 'bitcoin-cash').amount;
    const rawMaximum = callerCap < best ? callerCap : best;
    let wrapped = map.wrapAmount('bch', rawMaximum, 'bitcoin-cash').amount;
    if (map.unwrapAmount('bch', wrapped, 'bitcoin-cash').amount > rawMaximum) wrapped -= 1n;
    if (wrapped <= 0n) return 0n;
    const amount = map.unwrapAmount('bch', wrapped, 'bitcoin-cash').amount;
    const variable = (wrapped * fees.feeRatio) / fees.feeRatioDivisor;
    const bridgeFee = variable > fees.bridgeFee ? variable : fees.bridgeFee;
    if (wrapped <= bridgeFee + fees.networkFee || amount < 546n) return 0n;
    // Authenticate every selected parent with the same builder used by preparation.
    generateBitcoinCashUnsignedLock({
      ...route,
      bridgeFee,
      networkFee: fees.networkFee,
      amount,
      fromAddress: original.fromAddress,
      lockAddress: policy.lockAddress,
      feeRate: policy.feeRate,
      maxFee: policy.maxFee,
      utxos: candidates.slice(0, count),
    });
    return wrapped;
  };

  return Object.freeze({ getMinTransfer, getMaxTransfer });
};
