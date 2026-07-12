import { encode } from 'cbor-x';
import { Buffer } from 'node:buffer';

export function decodeHex(s: string): Uint8Array {
  return Uint8Array.from(Buffer.from(s, 'hex'));
}

export function encodeHex(arr: Uint8Array): string {
  return Buffer.from(arr).toString('hex');
}

/**
 * convert a hex to cbor
 * @param hex
 */
export const hexToCbor = (hex: string) =>
  Buffer.from(encode(Buffer.from(hex, 'hex'))).toString('hex');
