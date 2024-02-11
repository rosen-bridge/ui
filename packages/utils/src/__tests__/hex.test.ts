import { expect, test } from 'vitest';

import { decodeHex, encodeHex } from '../hex';

test('should return a Uint8Array given a text', () => {
  const res = decodeHex('bada55');
  expect(res).toEqual(new Uint8Array([186, 218, 85]));
});

test('should return a hexadecimal string given a uint8array', () => {
  const res = encodeHex(new Uint8Array([186, 218, 85]));
  expect(res).toEqual('bada55');
});
