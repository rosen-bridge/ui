import { Buffer } from 'buffer';

export function decodeHex(s: string): Uint8Array {
  return Uint8Array.from(Buffer.from(s, 'hex'));
}

export function encodeHex(arr: Uint8Array): string {
  console.log('@@@@ test ');
  return Buffer.from(arr).toString('hex');
}
