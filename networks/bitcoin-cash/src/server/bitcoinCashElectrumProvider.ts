import { createHash } from 'node:crypto';

import {
  cashAddressToLockingBytecode,
  decodeTransactionBCH,
  encodeTransactionBCH,
  lockingBytecodeToCashAddress,
} from '@bitauth/libauth';

import {
  type BitcoinCashElectrumOptions,
  BitcoinCashElectrumSession,
  ELECTRUM_LIMITS,
} from './electrumSession.js';

// BCHN chainparams.cpp, revision 7359f5ce1d1bf4984e84ff59e4dc8e1e2cc7e936.
// This Axion checkpoint distinguishes BCH from BTC and the ABC/XEC fork.
export const BCH_AXION_CHECKPOINT = {
  height: 661648,
  hash: '0000000000000000029e471c41818d24b8b74c911071c4ef0b4a0509f9b5a8ce',
} as const;

const MAX_MONEY = 2_100_000_000_000_000n;
const MAX_UTXOS = 1000;
const MAX_PARENT_BYTES = 1_000_000;
const MAX_PARENT_HEX = 4_000_000;

/** Authenticated native source output, in raw satoshi units. */
export interface BitcoinCashSpendableUtxo {
  txId: string;
  index: number;
  value: bigint;
  scriptPubKey: string;
  parentTransactionHex: string;
  height: number;
  confirmations: number;
  coinbase: boolean;
}

interface Tip {
  height: number;
  hash: string;
}

interface UtxoRow {
  txId: string;
  index: number;
  height: number;
  value: bigint;
}

interface AuthenticatedParent {
  raw: string;
  transaction: Exclude<ReturnType<typeof decodeTransactionBCH>, string>;
}

/** Computes one SHA256 digest without changing the caller's bytes. */
const hashBytes = (bytes: Uint8Array): Buffer => createHash('sha256').update(bytes).digest();
/** Produces the displayed BCH block or transaction identifier from exact bytes. */
const blockOrTransactionHash = (bytes: Uint8Array): string =>
  hashBytes(hashBytes(bytes)).reverse().toString('hex');

/** Rejects malformed or oversized hex before allocating its decoded bytes. */
const hexBytes = (value: unknown, maxBytes: number): Uint8Array => {
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    value.length > maxBytes * 2 ||
    !/^(?:[0-9a-fA-F]{2})+$/.test(value)
  ) {
    throw new Error('Invalid bounded BCH hexadecimal bytes');
  }
  return Uint8Array.from(Buffer.from(value, 'hex'));
};

/** Requires an exact 80-byte header before computing its displayed block hash. */
const headerHash = (value: unknown): string => {
  const bytes = hexBytes(value, 80);
  if (bytes.length !== 80) throw new Error('Invalid BCH block header length');
  return blockOrTransactionHash(bytes);
};

/** Resolves only canonical ordinary mainnet P2PKH CashAddr source scripts. */
export const bitcoinCashSourceScript = (address: string): string => {
  if (typeof address !== 'string' || address.length > 128) {
    throw new Error('Invalid BCH source CashAddr');
  }
  const decoded = cashAddressToLockingBytecode(address);
  if (
    typeof decoded === 'string' ||
    decoded.prefix !== 'bitcoincash' ||
    decoded.tokenSupport ||
    !/^76a914[0-9a-f]{40}88ac$/.test(Buffer.from(decoded.bytecode).toString('hex'))
  ) {
    throw new Error('BCH source requires an ordinary mainnet P2PKH CashAddr');
  }
  const canonical = lockingBytecodeToCashAddress({
    bytecode: decoded.bytecode,
    prefix: 'bitcoincash',
    tokenSupport: false,
  });
  if (typeof canonical === 'string' || canonical.address !== address) {
    throw new Error('BCH source requires a canonical prefixed lowercase CashAddr');
  }
  return Buffer.from(decoded.bytecode).toString('hex');
};

/** Validates the configured indexer's safe height and exact header bytes. */
const readTip = async (session: BitcoinCashElectrumSession): Promise<Tip> => {
  const result = await session.request('blockchain.headers.get_tip', []);
  if (
    !result ||
    typeof result !== 'object' ||
    Array.isArray(result) ||
    !('height' in result) ||
    !Number.isSafeInteger(result.height) ||
    (result.height as number) < BCH_AXION_CHECKPOINT.height ||
    !('hex' in result)
  ) {
    throw new Error('Invalid BCH Electrum chain tip');
  }
  return { height: result.height as number, hash: headerHash(result.hex) };
};

/** Validates bounded native UTXO rows and their unique outpoint identities. */
const rowsFromResult = (result: unknown, tipHeight: number): UtxoRow[] => {
  if (!Array.isArray(result) || result.length > MAX_UTXOS) {
    throw new Error('BCH Electrum UTXO count limit exceeded');
  }
  const seen = new Set<string>();
  return result.map((row: unknown) => {
    if (
      !row ||
      typeof row !== 'object' ||
      Array.isArray(row) ||
      !('tx_hash' in row) ||
      typeof row.tx_hash !== 'string' ||
      !/^[0-9a-f]{64}$/.test(row.tx_hash) ||
      !('tx_pos' in row) ||
      !Number.isSafeInteger(row.tx_pos) ||
      (row.tx_pos as number) < 0 ||
      (row.tx_pos as number) > 0xffffffff ||
      !('height' in row) ||
      !Number.isSafeInteger(row.height) ||
      (row.height as number) < 0 ||
      (row.height as number) > tipHeight ||
      !('value' in row) ||
      !Number.isSafeInteger(row.value) ||
      (row.value as number) < 0 ||
      (row.value as number) > Number(MAX_MONEY) ||
      Object.hasOwn(row, 'token_data')
    ) {
      throw new Error('Malformed native BCH Electrum UTXO');
    }
    const id = `${row.tx_hash}.${row.tx_pos}`;
    if (seen.has(id)) throw new Error('Duplicate BCH Electrum UTXO');
    seen.add(id);
    return {
      txId: row.tx_hash,
      index: row.tx_pos as number,
      height: row.height as number,
      value: BigInt(row.value as number),
    };
  });
};

/** Canonicalizes validated rows for an order-independent snapshot comparison. */
const snapshot = (rows: readonly UtxoRow[]): string =>
  rows
    .map((row) => `${row.txId}.${row.index}:${row.height}:${row.value}`)
    .sort()
    .join('|');

/** Internal handshake shared by read and explicitly authorized submission sessions. */
export const authenticateBitcoinCashElectrumSession = async (
  session: BitcoinCashElectrumSession,
): Promise<void> => {
  const version = await session.request('server.version', ['Rosen BCH UI', ['1.5', '1.6']]);
  if (
    !Array.isArray(version) ||
    version.length !== 2 ||
    typeof version[0] !== 'string' ||
    typeof version[1] !== 'string' ||
    // The offered maximum "1.6" is numerically 1.6.0, not a patch wildcard.
    !/^1\.(?:5(?:\.\d+)?|6(?:\.0+)?)$/.test(version[1])
  ) {
    throw new Error('BCH Electrum protocol 1.5 or 1.6 is required');
  }
  const anchor = await session.request('blockchain.block.header', [BCH_AXION_CHECKPOINT.height, 0]);
  if (headerHash(anchor) !== BCH_AXION_CHECKPOINT.hash) {
    throw new Error('BCH Electrum checkpoint identity mismatch');
  }
  session.checkDeadline();
};

/**
 * Returns native UTXOs after authenticating raw parents and a stable snapshot.
 * @param session Owned session whose BCH checkpoint handshake has already passed.
 * @param address Ordinary mainnet P2PKH CashAddr owned by the source wallet.
 * @returns Confirmed native outputs, excluding immature coinbase and zero value.
 * @remarks The configured indexer remains trusted for height and unspent status.
 * Returned parent contexts include repeated copies and are capped at four million
 * hex characters; bound exhaustion rejects the snapshot without truncation.
 */
export const readBitcoinCashSpendableUtxosOnSession = async (
  session: BitcoinCashElectrumSession,
  address: string,
): Promise<BitcoinCashSpendableUtxo[]> => {
  const script = bitcoinCashSourceScript(address);
  const scriptHash = hashBytes(Buffer.from(script, 'hex')).reverse().toString('hex');
  const tip = await readTip(session);
  /** Fetches native-only rows within the initial snapshot's validated height. */
  const list = async (): Promise<UtxoRow[]> =>
    rowsFromResult(
      await session.request(
        'blockchain.scripthash.listunspent',
        [scriptHash, 'exclude_tokens'],
        ELECTRUM_LIMITS.listBytes,
      ),
      tip.height,
    );
  const rows = await list();
  const parents = new Map<string, AuthenticatedParent>();
  const spendable: BitcoinCashSpendableUtxo[] = [];
  let parentHexCharacters = 0;
  let returnedParentHexCharacters = 0;
  let total = 0n;
  for (const row of rows) {
    session.checkDeadline();
    let authenticated = parents.get(row.txId);
    if (authenticated === undefined) {
      const result = await session.request(
        'blockchain.transaction.get',
        [row.txId, false],
        ELECTRUM_LIMITS.frameBytes,
      );
      const bytes = hexBytes(result, MAX_PARENT_BYTES);
      const raw = Buffer.from(bytes).toString('hex');
      parentHexCharacters += raw.length;
      if (parentHexCharacters > MAX_PARENT_HEX)
        throw new Error('BCH parent context byte limit exceeded');
      if (blockOrTransactionHash(bytes) !== row.txId)
        throw new Error('BCH parent transaction hash mismatch');
      const transaction = decodeTransactionBCH(Uint8Array.from(bytes));
      if (
        typeof transaction === 'string' ||
        !transaction.inputs.length ||
        !transaction.outputs.length ||
        Buffer.from(encodeTransactionBCH(transaction)).toString('hex') !== raw
      ) {
        throw new Error('Invalid canonical BCH parent transaction');
      }
      session.checkDeadline();
      authenticated = { raw, transaction };
      parents.set(row.txId, authenticated);
    }
    const { raw, transaction: parent } = authenticated;
    const output = parent.outputs[row.index];
    if (
      !output ||
      output.token !== undefined ||
      output.valueSatoshis !== row.value ||
      Buffer.from(output.lockingBytecode).toString('hex') !== script
    ) {
      throw new Error('BCH authenticated parent output mismatch');
    }
    const coinbase =
      parent.inputs.length === 1 &&
      parent.inputs[0].outpointIndex === 0xffffffff &&
      parent.inputs[0].outpointTransactionHash.every((byte) => byte === 0);
    const confirmations = row.height === 0 ? 0 : tip.height - row.height + 1;
    if (row.value === 0n || confirmations < (coinbase ? 100 : 1)) continue;
    returnedParentHexCharacters += raw.length;
    if (returnedParentHexCharacters > MAX_PARENT_HEX)
      throw new Error('BCH returned UTXO context limit exceeded');
    total += row.value;
    if (total > MAX_MONEY) throw new Error('BCH native balance exceeds money limit');
    spendable.push({
      txId: row.txId,
      index: row.index,
      value: row.value,
      scriptPubKey: script,
      parentTransactionHex: raw,
      height: row.height,
      confirmations,
      coinbase,
    });
  }
  const finalRows = await list();
  const finalTip = await readTip(session);
  if (
    tip.height !== finalTip.height ||
    tip.hash !== finalTip.hash ||
    snapshot(rows) !== snapshot(finalRows)
  ) {
    throw new Error('BCH Electrum UTXO snapshot changed');
  }
  return spendable;
};

/** Read-only provider for arbitrary ordinary BCH P2PKH source addresses. */
class BitcoinCashElectrumProvider {
  /** Stores server-owned endpoint options for separately bounded read sessions. */
  constructor(private readonly options: BitcoinCashElectrumOptions) {}

  /** Authenticates BCH identity before a read and always releases the session. */
  private withSession = async <Result>(
    read: (session: BitcoinCashElectrumSession) => Promise<Result>,
  ): Promise<Result> => {
    const session = await BitcoinCashElectrumSession.open(this.options);
    try {
      await authenticateBitcoinCashElectrumSession(session);
      const result = await read(session);
      session.checkDeadline();
      return result;
    } finally {
      session.close();
    }
  };

  /** Returns a bounded authenticated source snapshot on a fresh read-only session. */
  getSpendableUtxos = async (address: string): Promise<BitcoinCashSpendableUtxo[]> => {
    bitcoinCashSourceScript(address);
    return this.withSession((session) => readBitcoinCashSpendableUtxosOnSession(session, address));
  };

  /**
   * Sums the same authenticated spendable snapshot without decimal conversion.
   * @param address Ordinary mainnet source CashAddr.
   * @returns Exact native satoshis and an empty token collection.
   */
  getAddressAssets = async (address: string): Promise<{ nativeToken: bigint; tokens: [] }> => ({
    nativeToken: (await this.getSpendableUtxos(address)).reduce(
      (total, utxo) => total + utxo.value,
      0n,
    ),
    tokens: [],
  });

  /** Returns the configured BCH indexer's current height after checkpoint verification. */
  getHeight = async (): Promise<number> =>
    this.withSession(async (session) => (await readTip(session)).height);
}

/**
 * Creates a read-only BCH provider from a server-owned endpoint configuration.
 * @param options Verified TLS hostname/port and optional finite operation deadline.
 * @returns Native balance, spendable UTXO and height readers; no broadcast method.
 */
export const createBitcoinCashElectrumProvider = (
  options: BitcoinCashElectrumOptions,
): BitcoinCashElectrumProvider => new BitcoinCashElectrumProvider({ ...options });
