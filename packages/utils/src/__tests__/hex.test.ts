import { describe, expect, it } from 'vitest';

import { decodeHex, encodeHex } from '../hex';

describe('hex encoder and decoder', () => {
  /**
   * @target decodeHex function should return a Uint8Array given a text
   *
   * @dependencies
   *
   * @scenario
   * - create a hex string and pass it to the function
   * - create a the equivalent uint8Array of the hex
   *   string and compare it with the returned uint 8 array
   *
   * @expected
   * - the function should return the correct uint8Array
   */
  it('should return a Uint8Array given a text', () => {
    const res = decodeHex('bada55');
    expect(res).toEqual(new Uint8Array([186, 218, 85]));
  });

  /**
   * @target encodeHex function should return a hexadecimal
   *  string given a uint8array
   *
   * @dependencies
   *
   * @scenario
   * - create a test Unit8Array with some test values
   * - create an equivalent hex string of the Uint8Array
   *   and check it against returned string from the function
   *
   * @expected
   * - the function should return the correct hex string
   */

  it('should return a hexadecimal string given a uint8array', () => {
    const res = encodeHex(new Uint8Array([186, 218, 85]));
    expect(res).toEqual('bada55');
  });
});
