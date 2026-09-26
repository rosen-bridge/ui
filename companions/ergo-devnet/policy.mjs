import assert from 'node:assert/strict';

export function assertExactTokenLockValue(lock, rest, inputValue) {
  const value = (output) => BigInt(output.value);
  assert.equal(
    rest.reduce((sum, output) => sum + value(output), value(lock)),
    BigInt(inputValue),
    'ERG value does not balance',
  );
  assert.equal(value(lock), 2_000_000n, 'Token Lock must contain exactly 2,000,000 nanoERG');
}
