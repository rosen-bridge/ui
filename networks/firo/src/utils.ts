import { encodeAddress } from '@rosen-bridge/address-codec';
import {
  CalculateFee,
  calculateFeeCreator,
  getMinTransferCreator as getMinTransferCreatorBase,
} from '@rosen-network/base';
import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';
import { Psbt, address } from 'bitcoinjs-lib';
import { createHash } from 'crypto';
import * as net from 'net';

import {
  CONFIRMATION_TARGET,
  FIRO_TX_BASE_SIZE,
  FIRO_INPUT_SIZE,
  MINIMUM_UTXO_VALUE,
  FIRO_OUTPUT_SIZE,
  FIRO_NETWORK,
} from './constants';
import type { FiroUtxo } from './types';

// Base58 alphabet (Bitcoin/Firo style)
const BASE58_ALPHABET =
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

// ─── Configuration ───────────────────────────────────────────────────────

const getElectrumxHost = () => {
  const host = process.env.FIRO_ELECTRUMX_HOST;
  if (!host) throw Error('FIRO_ELECTRUMX_HOST is not set');
  return host;
};

const getElectrumxPort = () => {
  const port = process.env.FIRO_ELECTRUMX_PORT;
  if (!port) throw Error('FIRO_ELECTRUMX_PORT is not set');
  return parseInt(port, 10);
};

// ─── Base58 / scripthash ────────────────────────────────────────────────

function base58Decode(encoded: string): Buffer {
  // Count leading '1' characters (each encodes a zero byte)
  let leadingZeros = 0;
  for (const char of encoded) {
    if (char === '1') leadingZeros++;
    else break;
  }

  let big = 0n;
  for (const c of encoded) {
    const digit = BASE58_ALPHABET.indexOf(c);
    if (digit < 0) throw new Error(`Invalid base58 character: ${c}`);
    big = big * 58n + BigInt(digit);
  }

  const hex = big.toString(16);
  const paddedHex = (hex.length % 2 === 0 ? '' : '0') + hex;
  const fullHex = '00'.repeat(leadingZeros) + paddedHex;
  return Buffer.from(fullHex, 'hex');
}

function addressToScripthash(address: string): string {
  const decoded = base58Decode(address);
  // Skip version byte, extract 20-byte pubkey hash, skip 4-byte checksum
  const pubkeyHash = decoded.subarray(1, 21);
  // Build P2PKH script: OP_DUP OP_HASH160 <20 bytes> OP_EQUALVERIFY OP_CHECKSIG
  const script = Buffer.concat([
    Buffer.from([0x76, 0xa9, 0x14]),
    pubkeyHash,
    Buffer.from([0x88, 0xac]),
  ]);
  const scripthash = createHash('sha256').update(script).digest().reverse();
  return scripthash.toString('hex');
}

// ─── ElectrumX TCP ───────────────────────────────────────────────────────

const callElectrumX = async <T>(
  method: string,
  params: Array<unknown> = [],
): Promise<T> => {
  const host = getElectrumxHost();
  const port = getElectrumxPort();

  return new Promise((resolve, reject) => {
    const socket = net.createConnection(port, host);
    let buffer = '';

    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error(`ElectrumX request timeout [${method}]`));
    }, 30000);

    socket.on('data', (data: Buffer) => {
      buffer += data.toString('utf-8');
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const response = JSON.parse(line);
          if (response.id === 1) {
            clearTimeout(timer);
            socket.destroy();
            if (response.error) {
              reject(
                new Error(
                  `ElectrumX error: ${response.error.message || JSON.stringify(response.error)}`,
                ),
              );
            } else {
              resolve(response.result as T);
            }
          }
        } catch {
          // ignore parse errors
        }
      }
    });

    socket.on('error', (err: Error) => {
      clearTimeout(timer);
      reject(err);
    });

    socket.once('connect', () => {
      // Send server.version handshake
      socket.write(
        JSON.stringify({
          jsonrpc: '2.0',
          id: 0,
          method: 'server.version',
          params: ['rosen-ui', '1.4'],
        }) + '\n',
      );
      // Send the actual request
      socket.write(
        JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method,
          params,
        }) + '\n',
      );
    });
  });
};

// ─── Transaction parsing helpers ─────────────────────────────────────────

const readCompactSize = (buffer: Buffer, offset: number) => {
  const first = buffer[offset];
  if (first === undefined) throw Error('Invalid Firo transaction hex');

  if (first < 0xfd) return { value: first, size: 1 };
  if (first === 0xfd) {
    if (offset + 3 > buffer.length) throw Error('Invalid Firo transaction hex');
    return { value: buffer.readUInt16LE(offset + 1), size: 3 };
  }
  if (first === 0xfe) {
    if (offset + 5 > buffer.length) throw Error('Invalid Firo transaction hex');
    return { value: buffer.readUInt32LE(offset + 1), size: 5 };
  }

  if (offset + 9 > buffer.length) throw Error('Invalid Firo transaction hex');
  const value = buffer.readBigUInt64LE(offset + 1);
  if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw Error('Unsupported Firo transaction field size');
  }
  return { value: Number(value), size: 9 };
};

const assertBytes = (buffer: Buffer, offset: number, size: number) => {
  if (offset + size > buffer.length)
    throw Error('Invalid Firo transaction hex');
};

const stripFiroExtraPayload = (txHex: string) => {
  const buffer = Buffer.from(txHex, 'hex');
  assertBytes(buffer, 0, 4);

  const versionAndType = buffer.readUInt32LE(0);
  const version = versionAndType & 0xffff;
  const type = versionAndType >>> 16;
  if (version !== 3 || type === 0) return txHex;

  let offset = 4;
  let compactSize = readCompactSize(buffer, offset);
  offset += compactSize.size;
  let inputCount = compactSize.value;

  let hasWitness = false;
  if (inputCount === 0) {
    assertBytes(buffer, offset, 1);
    const flags = buffer[offset];
    if (flags !== 0) {
      hasWitness = true;
      offset += 1;
      compactSize = readCompactSize(buffer, offset);
      offset += compactSize.size;
      inputCount = compactSize.value;
    }
  }

  for (let i = 0; i < inputCount; i++) {
    assertBytes(buffer, offset, 36);
    offset += 36;
    compactSize = readCompactSize(buffer, offset);
    offset += compactSize.size + compactSize.value;
    assertBytes(buffer, offset, 4);
    offset += 4;
  }

  compactSize = readCompactSize(buffer, offset);
  offset += compactSize.size;
  const outputCount = compactSize.value;

  for (let i = 0; i < outputCount; i++) {
    assertBytes(buffer, offset, 8);
    offset += 8;
    compactSize = readCompactSize(buffer, offset);
    offset += compactSize.size + compactSize.value;
  }

  if (hasWitness) {
    for (let i = 0; i < inputCount; i++) {
      compactSize = readCompactSize(buffer, offset);
      offset += compactSize.size;
      const witnessCount = compactSize.value;
      for (let j = 0; j < witnessCount; j++) {
        compactSize = readCompactSize(buffer, offset);
        offset += compactSize.size + compactSize.value;
      }
    }
  }

  assertBytes(buffer, offset, 4);
  offset += 4;
  if (offset === buffer.length) return txHex;

  compactSize = readCompactSize(buffer, offset);
  const payloadEnd = offset + compactSize.size + compactSize.value;
  if (payloadEnd !== buffer.length) {
    throw Error('Invalid Firo transaction extra payload');
  }

  // bitcoinjs-lib does not understand Firo special-transaction payloads.
  // The stripped form is only used as PSBT nonWitnessUtxo prevout material.
  return buffer.subarray(0, offset).toString('hex');
};

// ─── Network operations ──────────────────────────────────────────────────

/**
 * builds a firo: payment URI with amount and op_return metadata
 * @param address - lock address
 * @param amount - amount in FIRO (decimal string)
 * @param opReturnData - hex-encoded OP_RETURN data
 */
export const buildPaymentUri = (
  address: string,
  amount: string,
  opReturnData: string,
): string => {
  return `firo:${address}?amount=${amount}&op_return=${opReturnData}`;
};

/**
 * generates metadata for lock transaction
 * @param toChain
 * @param toAddress
 * @param networkFee
 * @param bridgeFee
 * @returns
 */
export const generateOpReturnData = async (
  toChain: Network,
  toAddress: string,
  networkFee: string,
  bridgeFee: string,
): Promise<string> => {
  // parse toChain
  const toChainCode = (NETWORKS[toChain]?.index ?? -1) as number;
  if (toChainCode === -1) throw Error(`invalid toChain [${toChain}]`);
  const toChainHex = toChainCode.toString(16).padStart(2, '0');

  // parse bridgeFee
  const bridgeFeeHex = BigInt(bridgeFee).toString(16).padStart(16, '0');

  // parse networkFee
  const networkFeeHex = BigInt(networkFee).toString(16).padStart(16, '0');

  // parse toAddress
  const addressHex = encodeAddress(toChain, toAddress);
  const addressLengthCode = (addressHex.length / 2)
    .toString(16)
    .padStart(2, '0');

  return Promise.resolve(
    toChainHex + bridgeFeeHex + networkFeeHex + addressLengthCode + addressHex,
  );
};

/**
 * gets utxos by address from ElectrumX
 * @param address
 * @returns
 */
export const getAddressUtxos = async (
  address: string,
): Promise<Array<FiroUtxo>> => {
  const scripthash = addressToScripthash(address);
  const utxos = await callElectrumX<
    Array<{
      tx_hash: string;
      tx_pos: number;
      height: number;
      value: number;
    }>
  >('blockchain.scripthash.listunspent', [scripthash]);

  return utxos
    .filter((utxo) => utxo.height > 0)
    .map((utxo) => ({
      txId: utxo.tx_hash,
      index: utxo.tx_pos,
      value: BigInt(utxo.value),
    }));
};

/**
 * gets tx hex by txId from ElectrumX
 * @param txId
 * @returns
 */
export const getTxHex = async (txId: string): Promise<string> => {
  const txHex = await callElectrumX<string>('blockchain.transaction.get', [
    txId,
  ]);
  return stripFiroExtraPayload(txHex);
};

/**
 * gets address Firo balance from ElectrumX
 * @param address
 * @returns this is a UNWRAPPED-VALUE amount
 */
export const getAddressBalance = async (address: string): Promise<bigint> => {
  const scripthash = addressToScripthash(address);
  const balance = await callElectrumX<{
    confirmed: number;
    unconfirmed: number;
  }>('blockchain.scripthash.get_balance', [scripthash]);
  return BigInt(balance.confirmed);
};

/**
 * gets current fee ratio of the network from ElectrumX
 * @returns fee ratio in satoshis per byte
 */
export const getFeeRatio = async (): Promise<number> => {
  const feeRate = await callElectrumX<number>('blockchain.estimatefee', [
    CONFIRMATION_TARGET,
  ]);

  if (feeRate <= 0) {
    // Fallback if estimatefee returns -1 or 0
    return 1;
  }

  // ElectrumX returns BTC/kB, convert to satoshis/byte
  const feeSatoshis = Math.ceil(feeRate * 100000000);
  const feePerByte = Math.ceil(feeSatoshis / 1000);
  return feePerByte;
};

/**
 * gets the minimum amount of satoshi for a utxo that can cover
 * additional fee for adding it to a tx
 * @returns the minimum UNWRAPPED-VALUE amount
 */
export const getMinimumMeaningfulFiro = (feeRatio: number): bigint => {
  return BigInt(Math.ceil(feeRatio * FIRO_INPUT_SIZE)) + MINIMUM_UTXO_VALUE;
};

/**
 * estimates tx size based on number of inputs and outputs
 * inputs and outputs required fee are estimated by FIRO_INPUT_SIZE and FIRO_OUTPUT_SIZE
 * @param inputSize
 * @param outputSize
 * @param opReturnLength
 */
export const estimateTxSize = (
  inputSize: number,
  outputSize: number,
  opReturnLength: number,
): number => {
  const opReturnDataSize = opReturnLength / 2;
  const opReturnPushSize = opReturnDataSize > 75 ? 2 : 1;
  const opReturnScriptSize =
    1 + // OP_RETURN
    opReturnPushSize +
    opReturnDataSize;
  const opReturnOutputSize =
    8 + // output value
    1 + // compactSize script length for Rosen's <=80-byte OP_RETURN
    opReturnScriptSize;

  const x =
    FIRO_TX_BASE_SIZE +
    opReturnOutputSize +
    inputSize * FIRO_INPUT_SIZE + // inputs size
    outputSize * FIRO_OUTPUT_SIZE; // outputs size
  return x;
};

/**
 * submits a transaction to ElectrumX
 * @param serializedPsbt psbt in base64 or hex format
 * @param encoding psbt encoding ('base64' or 'hex')
 */
export const submitTransaction = async (
  serializedPsbt: string,
  encoding: 'base64' | 'hex',
): Promise<string> => {
  const psbt =
    encoding === 'base64'
      ? Psbt.fromBase64(serializedPsbt)
      : Psbt.fromHex(serializedPsbt);
  psbt.finalizeAllInputs();
  const txHex = psbt.extractTransaction().toHex();

  return callElectrumX<string>('blockchain.transaction.broadcast', [txHex]);
};

export const isValidAddress = (addr: string) => {
  try {
    address.toOutputScript(addr, FIRO_NETWORK);
    return true;
  } catch {
    // If an error is thrown, the address is invalid
    return false;
  }
};

export const getHeight = async (): Promise<number> => {
  const result = await callElectrumX<{ height: number }>(
    'blockchain.headers.subscribe',
    [],
  );
  return result.height;
};

export const calculateFee: CalculateFee = calculateFeeCreator(
  NETWORKS.firo.key,
  getHeight,
);

export const getMinTransferCreator = getMinTransferCreatorBase(
  NETWORKS.firo.key,
  calculateFee,
);
