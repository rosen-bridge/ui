import { createHash } from 'node:crypto';

export type ZcashNetworkName = 'mainnet' | 'testnet' | 'regtest';

const base58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

/** Transparent P2PKH only. Testnet and Regtest share a prefix, so callers must bind genesis. */
export function transparentP2pkhScript(address: string, network: ZcashNetworkName): string {
  if (
    !/^[1-9A-HJ-NP-Za-km-z]{35}$/.test(address) ||
    !['mainnet', 'testnet', 'regtest'].includes(network)
  ) {
    throw new Error('Unsupported Zcash transparent P2PKH address');
  }

  let value = 0n;
  for (const digit of address) value = value * 58n + BigInt(base58.indexOf(digit));
  const decoded: number[] = [];
  while (value > 0n) {
    decoded.unshift(Number(value % 256n));
    value /= 256n;
  }
  for (const digit of address) {
    if (digit !== '1') break;
    decoded.unshift(0);
  }
  const bytes = Buffer.from(decoded);
  if (bytes.length !== 26) throw new Error('Invalid Zcash address length');

  const payload = bytes.subarray(0, 22);
  const checksum = createHash('sha256')
    .update(createHash('sha256').update(payload).digest())
    .digest()
    .subarray(0, 4);
  if (!checksum.equals(bytes.subarray(22))) throw new Error('Invalid Zcash address checksum');

  const expectedPrefix = network === 'mainnet' ? '1cb8' : '1d25';
  if (payload.subarray(0, 2).toString('hex') !== expectedPrefix) {
    throw new Error('Zcash address belongs to another network or receiver type');
  }
  return `76a914${payload.subarray(2).toString('hex')}88ac`;
}
