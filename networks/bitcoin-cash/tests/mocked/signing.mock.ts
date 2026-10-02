import {
  binToHex,
  decodeTransactionBCH,
  encodeTransactionBCH,
  generateSigningSerializationBCH,
  hash256,
  hashTransaction,
  hexToBin,
  lockingBytecodeToCashAddress,
  ripemd160,
  secp256k1,
  sha256,
} from '@bitauth/libauth';

import {
  type BitcoinCashUnsignedLock,
  generateBitcoinCashUnsignedLock,
} from '../../src/generateUnsignedTx';
import type { BitcoinCashSpendableUtxo } from '../../src/server/bitcoinCashElectrumProvider';

/** Public secp256k1 generator scalar fixture; never wallet material. */
const scalar = Uint8Array.from([...Array(31).fill(0), 1]);
const derived = secp256k1.derivePublicKeyCompressed(scalar);
if (typeof derived === 'string') throw new Error(derived);
export const publicKey = derived;
const sourceScript = `76a914${binToHex(ripemd160.hash(sha256.hash(publicKey)))}88ac`;
const address = (script: string) => {
  const result = lockingBytecodeToCashAddress({
    bytecode: hexToBin(script),
    prefix: 'bitcoincash',
  });
  if (typeof result === 'string') throw new Error(result);
  return result.address;
};

/** Canonical synthetic parent and provider assertions at one confirmed tip. */
export const parentOutput = (nonce: number, value = 100_000n): BitcoinCashSpendableUtxo => {
  const raw = encodeTransactionBCH({
    version: 2,
    locktime: nonce,
    inputs: [
      {
        outpointIndex: 0,
        outpointTransactionHash: hexToBin('55'.repeat(32)),
        sequenceNumber: 0xffffffff,
        unlockingBytecode: new Uint8Array(),
      },
    ],
    outputs: [{ valueSatoshis: value, lockingBytecode: hexToBin(sourceScript) }],
  });
  return {
    txId: hashTransaction(raw),
    index: 0,
    value,
    scriptPubKey: sourceScript,
    parentTransactionHex: binToHex(raw),
    height: 700000,
    confirmations: 1,
    coinbase: false,
  };
};

/** Real builder output with one or two authenticated synthetic parents. */
export const signingIntent = (twoInputs = false): BitcoinCashUnsignedLock =>
  generateBitcoinCashUnsignedLock({
    fromAddress: address(sourceScript),
    lockAddress: address(`76a914${'22'.repeat(20)}88ac`),
    amount: twoInputs ? 150000n : 50000n,
    feeRate: 2,
    maxFee: 10000n,
    toChain: 'ethereum',
    toAddress: `0x${'12'.repeat(20)}`,
    bridgeFee: 100n,
    networkFee: 100n,
    utxos: twoInputs ? [parentOutput(1), parentOutput(2)] : [parentOutput(1)],
  });

/** Sign the exact frozen intent using real libauth BCH Schnorr 0x41 primitives. */
export const signIntent = (intent: BitcoinCashUnsignedLock): string => {
  const transaction = decodeTransactionBCH(hexToBin(intent.unsignedTransactionHex));
  if (typeof transaction === 'string') throw new Error(transaction);
  const sourceOutputs = intent.selectedUtxos.map((utxo) => ({
    valueSatoshis: utxo.value,
    lockingBytecode: hexToBin(utxo.scriptPubKey),
  }));
  for (const [inputIndex, input] of transaction.inputs.entries()) {
    const preimage = generateSigningSerializationBCH(
      { inputIndex, sourceOutputs, transaction },
      {
        coveredBytecode: sourceOutputs[inputIndex].lockingBytecode,
        signingSerializationType: Uint8Array.of(0x41),
      },
    );
    const signature = secp256k1.signMessageHashSchnorr(scalar, hash256(preimage));
    if (typeof signature === 'string') throw new Error(signature);
    input.unlockingBytecode = Uint8Array.of(65, ...signature, 0x41, 33, ...publicKey);
  }
  return binToHex(encodeTransactionBCH(transaction));
};
