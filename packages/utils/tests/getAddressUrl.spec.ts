import { describe, expect, it } from 'vitest';

import { getAddressUrl } from '../src/getAddressUrl';

describe('getAddressUrl', () => {
  /**
   * @target Produce BCH explorer address links while retaining baseline links.
   * @dependencies Shared UI chain registry; no mocks.
   * @scenario Request BCH with a mainnet prefix and Bitcoin with a base58 value.
   * @expected Prefix-free Blockchair BCH path and unchanged Bitcoin path.
   */
  it('produces BCH links without changing Bitcoin address links', () => {
    expect(
      getAddressUrl('bitcoin-cash', 'bitcoincash:qqqszqgpqyqszqgpqyqszqgpqyqszqgpqyrygcdp8p'),
    ).toEqual(
      'https://blockchair.com/bitcoin-cash/address/qqqszqgpqyqszqgpqyqszqgpqyqszqgpqyrygcdp8p',
    );
    expect(getAddressUrl('bitcoin', 'example')).toEqual('https://mempool.space/address/example');
    expect(getAddressUrl(undefined, 'example')).toEqual(undefined);
  });
});
