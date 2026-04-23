import { describe, expect, it } from 'vitest';

import { getAddressUrl } from '../src/getAddressUrl';
import { getTokenUrl } from '../src/getTokenUrl';
import { getTxURL } from '../src/getTxUrl';

describe('Base explorer URLs', () => {
  it('should return the Base tx explorer URL', () => {
    expect(getTxURL('base', '0x4200000000000000000000000000000000000006')).toBe(
      'https://basescan.org/tx/0x4200000000000000000000000000000000000006',
    );
  });

  it('should return the Base address explorer URL', () => {
    expect(
      getAddressUrl('base', '0x4200000000000000000000000000000000000006'),
    ).toBe(
      'https://basescan.org/address/0x4200000000000000000000000000000000000006',
    );
  });

  it('should return the Base token explorer URL', () => {
    expect(
      getTokenUrl('base', '0x4200000000000000000000000000000000000006'),
    ).toBe(
      'https://basescan.org/token/0x4200000000000000000000000000000000000006',
    );
  });
});
