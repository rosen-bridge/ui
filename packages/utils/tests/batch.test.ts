import { describe, expect, it, vi } from 'vitest';

import { batch } from '../src/batch';

describe('batch', () => {
  /**
   * @target batch should merge concurrent single-key lookups into one load call
   *
   * @dependencies
   *
   * @scenario
   * - create a batched loader backed by a spy that returns a Map
   * - call the returned function for three different keys within the same tick
   * - await all three promises
   *
   * @expected
   * - the underlying load function is called exactly once
   * - load receives all three keys in a single array
   * - each caller receives the value mapped to its key
   */
  it('should merge concurrent single-key lookups into one load call', async () => {
    const load = vi.fn(async (keys: string[]) => new Map(keys.map((key) => [key, `value:${key}`])));

    const get = batch(load);

    const results = await Promise.all([get('a'), get('b'), get('c')]);

    expect(load).toHaveBeenCalledTimes(1);
    expect(load).toHaveBeenCalledWith(['a', 'b', 'c']);
    expect(results).toEqual(['value:a', 'value:b', 'value:c']);
  });

  /**
   * @target batch should resolve values when load returns a plain record
   *
   * @dependencies
   *
   * @scenario
   * - create a batched loader whose load returns a Record keyed by string
   * - request two keys concurrently
   *
   * @expected
   * - each key resolves to the matching record entry
   */
  it('should resolve values when load returns a plain record', async () => {
    const load = vi.fn(async (keys: number[]) =>
      Object.fromEntries(keys.map((key) => [String(key), key * 2])),
    );

    const get = batch<number, number>(load);

    const results = await Promise.all([get(1), get(2)]);

    expect(results).toEqual([2, 4]);
  });

  /**
   * @target batch should resolve to undefined for keys missing from the result
   *
   * @dependencies
   *
   * @scenario
   * - create a batched loader whose load omits one of the requested keys
   * - request the present and the missing key concurrently
   *
   * @expected
   * - the present key resolves to its value
   * - the missing key resolves to undefined
   */
  it('should resolve to undefined for keys missing from the result', async () => {
    const load = vi.fn(async () => new Map<string, string>([['known', 'hit']]));

    const get = batch<string, string>(load);

    const [known, unknown] = await Promise.all([get('known'), get('missing')]);

    expect(known).toBe('hit');
    expect(unknown).toBeUndefined();
  });

  /**
   * @target batch should cache resolved keys and not load them again
   *
   * @dependencies
   *
   * @scenario
   * - create a batched loader backed by a spy
   * - request a key and await it
   * - request the same key again and await it
   *
   * @expected
   * - load is called only once
   * - both calls return the same value
   */
  it('should cache resolved keys and not load them again', async () => {
    const load = vi.fn(async (keys: string[]) => new Map(keys.map((key) => [key, `value:${key}`])));

    const get = batch(load);

    const first = await get('a');
    const second = await get('a');

    expect(load).toHaveBeenCalledTimes(1);
    expect(first).toBe('value:a');
    expect(second).toBe('value:a');
  });

  /**
   * @target batch should return the same in-flight promise for a pending key
   *
   * @dependencies
   *
   * @scenario
   * - create a batched loader
   * - call the returned function twice for the same key before awaiting
   *
   * @expected
   * - both calls return the identical promise reference
   */
  it('should return the same in-flight promise for a pending key', () => {
    const get = batch(async (keys: string[]) => new Map(keys.map((key) => [key, key])));

    const a = get('a');
    const b = get('a');

    expect(a).toBe(b);
  });

  /**
   * @target batch should start a new load for keys requested in a later tick
   *
   * @dependencies
   *
   * @scenario
   * - create a batched loader backed by a spy
   * - request one key and await it
   * - request a different key and await it
   *
   * @expected
   * - load is called once per tick, twice in total
   * - each call receives only the keys requested in that tick
   */
  it('should start a new load for keys requested in a later tick', async () => {
    const load = vi.fn(async (keys: string[]) => new Map(keys.map((key) => [key, `value:${key}`])));

    const get = batch(load);

    await get('a');
    await get('b');

    expect(load).toHaveBeenCalledTimes(2);
    expect(load).toHaveBeenNthCalledWith(1, ['a']);
    expect(load).toHaveBeenNthCalledWith(2, ['b']);
  });

  /**
   * @target batch should reject every pending caller when load throws
   *
   * @dependencies
   *
   * @scenario
   * - create a batched loader whose load rejects
   * - request two keys concurrently
   *
   * @expected
   * - both callers reject with the thrown error
   */
  it('should reject every pending caller when load throws', async () => {
    const error = new Error('load failed');

    const get = batch(async () => {
      throw error;
    });

    const settled = await Promise.allSettled([get('a'), get('b')]);

    expect(settled).toEqual([
      { status: 'rejected', reason: error },
      { status: 'rejected', reason: error },
    ]);
  });

  /**
   * @target batch should retry a key on the next call after a failed load
   *
   * @dependencies
   *
   * @scenario
   * - create a batched loader whose load rejects on the first call and
   *   resolves on the second
   * - request a key, expect it to reject
   * - request the same key again, expect it to resolve
   *
   * @expected
   * - the failed key is not cached, so load runs again
   * - the second attempt resolves with the value
   */
  it('should retry a key on the next call after a failed load', async () => {
    const load = vi
      .fn<(keys: string[]) => Promise<Map<string, string>>>()
      .mockRejectedValueOnce(new Error('transient'))
      .mockImplementation(async (keys) => new Map(keys.map((key) => [key, `value:${key}`])));

    const get = batch(load);

    await expect(get('a')).rejects.toThrow('transient');
    await expect(get('a')).resolves.toBe('value:a');
    expect(load).toHaveBeenCalledTimes(2);
  });
});
