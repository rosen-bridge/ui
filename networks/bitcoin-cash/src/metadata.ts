import { encodeAddress } from '@rosen-bridge/address-codec';
import { isNetworkAvailable, NETWORKS } from '@rosen-ui/constants';

/** Native BCH lock metadata limits shared with the Rosen BCH extractor. */
export const MAX_BITCOIN_CASH_OP_RETURN_PAYLOAD_BYTES = 80;

/** Inputs already resolved through the shared chain registry and address codec. */
export interface BitcoinCashRosenMetadata {
  toChainIndex: number;
  encodedAddressHex: string;
  bridgeFee: bigint;
  networkFee: bigint;
}

/**
 * Serializes Rosen metadata as one canonical BCH OP_RETURN data push.
 * @param metadata Chain index, codec-produced destination bytes and Rosen-normalized uint64 fees.
 * @returns Complete locking bytecode for the zero-value metadata output.
 * @throws RangeError If a field is outside the bounded wire representation.
 * @remarks Callers must resolve the index and validate the destination with the
 * shared Rosen registry/codec. This byte serializer does not authorize a route,
 * build or sign a transaction, select a treasury, or validate an address.
 */
export const generateBitcoinCashOpReturn = (metadata: BitcoinCashRosenMetadata): Uint8Array => {
  const { toChainIndex, encodedAddressHex, bridgeFee, networkFee } = metadata;
  if (!Number.isInteger(toChainIndex) || toChainIndex < 0 || toChainIndex > 255) {
    throw new RangeError('Chain index must fit one byte');
  }
  for (const fee of [bridgeFee, networkFee]) {
    if (typeof fee !== 'bigint' || fee < 0n || fee > 0xffffffffffffffffn) {
      throw new RangeError('Rosen fees must be uint64 integers');
    }
  }
  if (
    typeof encodedAddressHex !== 'string' ||
    encodedAddressHex.length > (MAX_BITCOIN_CASH_OP_RETURN_PAYLOAD_BYTES - 18) * 2 ||
    !/^(?:[0-9a-fA-F]{2})+$/.test(encodedAddressHex)
  ) {
    throw new RangeError('Destination bytes must be nonempty bounded hex');
  }
  const addressLength = encodedAddressHex.length / 2;
  // Existing Rosen order: chain, bridge fee, network fee, address length, address.
  const payloadHex =
    toChainIndex.toString(16).padStart(2, '0') +
    bridgeFee.toString(16).padStart(16, '0') +
    networkFee.toString(16).padStart(16, '0') +
    addressLength.toString(16).padStart(2, '0') +
    encodedAddressHex;
  const payload = Uint8Array.from(payloadHex.match(/../g) ?? [], (byte) => parseInt(byte, 16));
  return Uint8Array.from([
    0x6a,
    ...(payload.length <= 75 ? [payload.length] : [0x4c, payload.length]),
    ...payload,
  ]);
};

/** Parameters for a BCH source lock; metadata fees use Rosen-normalized units. */
export interface BitcoinCashLockMetadata {
  toChain: string;
  toAddress: string;
  bridgeFee: bigint;
  networkFee: bigint;
}

/**
 * Resolves the shared Rosen chain registry and codec before serializing metadata.
 * @param metadata Destination and fees in Rosen-normalized units.
 * @returns Canonical BCH OP_RETURN locking bytecode.
 * @throws RangeError For unknown or unassigned destination chains.
 * @throws Error When the shared destination codec rejects the address.
 * @remarks This does not enable BCH as a source route or approve operator config.
 */
export const generateBitcoinCashLockMetadata = (metadata: BitcoinCashLockMetadata): Uint8Array => {
  if (!isNetworkAvailable(metadata.toChain)) {
    throw new RangeError('Destination chain is unknown or has no assigned Rosen index');
  }
  return generateBitcoinCashOpReturn({
    toChainIndex: NETWORKS[metadata.toChain].index,
    encodedAddressHex: encodeAddress(metadata.toChain, metadata.toAddress),
    bridgeFee: metadata.bridgeFee,
    networkFee: metadata.networkFee,
  });
};
