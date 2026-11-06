import { Address, NetworkPrefix } from 'ergo-lib-wasm-browser';
import { createFormControl } from 'react-hook-form';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { validateErgoAddress } from '@/utils/validateErgoAddress';

// Public secp256k1 generator point, not a signing key or funded wallet.
const publicKey = Uint8Array.from(
  Buffer.from('0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798', 'hex'),
);
const fixture = Address.p2pk_from_pk_bytes(publicKey);
const mainnet = fixture.to_base58(NetworkPrefix.Mainnet);
const testnet = fixture.to_base58(NetworkPrefix.Testnet);
fixture.free();

afterEach(() => vi.restoreAllMocks());

describe('validateErgoAddress with the real browser WASM bindings', () => {
  it.each([mainnet, testnet])('accepts an Ergo address on either network: %s', async (address) => {
    await expect(validateErgoAddress(address)).resolves.toBeUndefined();
  });

  it.each(['not-an-address', '0OIl', ' ', 'bc1qnotanergoaddress'])('rejects %j', async (value) => {
    await expect(validateErgoAddress(value)).resolves.toBe('Invalid Address');
  });

  it('rejects a base58 address whose checksum was changed', async () => {
    const replacement = mainnet.endsWith('1') ? '2' : '1';
    await expect(validateErgoAddress(mainnet.slice(0, -1) + replacement)).resolves.toBe(
      'Invalid Address',
    );
  });

  it('reports an empty field without parsing it', async () => {
    const parse = vi.spyOn(Address, 'from_base58');
    await expect(validateErgoAddress('')).resolves.toBe('Address cannot be empty');
    expect(parse).not.toHaveBeenCalled();
  });

  it('releases each successfully parsed WASM address', async () => {
    const release = vi.spyOn(Address.prototype, 'free');
    await validateErgoAddress(mainnet);
    await validateErgoAddress(testnet);
    expect(release).toHaveBeenCalledTimes(2);
  });

  it('exposes unexpected binding failures as a retryable field error', async () => {
    vi.spyOn(Address.prototype, 'free').mockImplementationOnce(() => {
      throw new Error('binding failure');
    });
    await expect(validateErgoAddress(mainnet)).resolves.toBe(
      'Something went wrong! please try again',
    );
  });
});

describe('react-hook-form validation', () => {
  it('prevents invalid submission, displays its error, and accepts a corrected address', async () => {
    const form = createFormControl({ defaultValues: { address: '' }, mode: 'onChange' });
    form.register('address', { validate: validateErgoAddress });
    const accepted = vi.fn();
    const rejected = vi.fn();

    await form.handleSubmit(accepted, rejected)();
    expect(accepted).not.toHaveBeenCalled();
    expect(form.getFieldState('address').error?.message).toBe('Address cannot be empty');

    form.setValue('address', 'invalid');
    await form.handleSubmit(accepted, rejected)();
    expect(accepted).not.toHaveBeenCalled();
    expect(form.getFieldState('address').error?.message).toBe('Invalid Address');

    form.setValue('address', mainnet);
    await form.handleSubmit(accepted, rejected)();
    expect(accepted).toHaveBeenCalledOnce();
    expect(accepted.mock.calls[0][0]).toEqual({ address: mainnet });
    expect(form.getFieldState('address').error).toBeUndefined();
  });
});
