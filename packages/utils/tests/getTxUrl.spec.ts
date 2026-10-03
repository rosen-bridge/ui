import { describe, expect, it } from 'vitest';

import { getTxURL } from '../src/getTxUrl';

describe('getTxURL', () => {
  /**
   * @target Produce BCH transaction links while retaining baseline links.
   * @dependencies Shared UI chain registry; no mocks.
   * @scenario Request BCH and Ethereum transaction links and a missing txid.
   * @expected BCH Blockchair path, unchanged Etherscan path and no empty link.
   */
  it('produces BCH links without changing Ethereum transaction links', () => {
    expect(getTxURL('bitcoin-cash', 'ab'.repeat(32))).toEqual(
      `https://blockchair.com/bitcoin-cash/transaction/${'ab'.repeat(32)}`,
    );
    expect(getTxURL('ethereum', 'example')).toEqual('https://etherscan.io/tx/example');
    expect(getTxURL('bitcoin-cash', '')).toEqual(undefined);
  });
});
