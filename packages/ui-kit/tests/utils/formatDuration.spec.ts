import { describe, it, expect } from 'vitest';

import { formatDuration } from '../../src';

describe('formatDuration', () => {
  /**
   * @target formatDuration should return error for NaN
   * @dependencies
   * @scenario
   * - pass NaN as input
   * - run function
   * - check returned object
   * @expected
   * - error should be true
   * - parts should be undefined
   */
  it('should return error for NaN', () => {
    const result = formatDuration(NaN);

    expect(result.error).toBe(true);
    expect(result.parts).toBeUndefined();
  });

  /**
   * @target formatDuration should return error for Infinity
   * @dependencies
   * @scenario
   * - pass Infinity as input
   * - run function
   * - check returned object
   * @expected
   * - error should be true
   * - parts should be undefined
   */
  it('should return error for Infinity', () => {
    const result = formatDuration(Infinity);

    expect(result.error).toBe(true);
    expect(result.parts).toBeUndefined();
  });

  /**
   * @target formatDuration should return error for negative numbers
   * @dependencies
   * @scenario
   * - pass a negative number
   * - run function
   * - check returned object
   * @expected
   * - error should be true
   * - parts should be undefined
   */
  it('should return error for negative numbers', () => {
    const result = formatDuration(-1000);

    expect(result.error).toBe(true);
    expect(result.parts).toBeUndefined();
  });

  /**
   * @target formatDuration should return undefined parts for undefined value
   * @dependencies
   * @scenario
   * - pass undefined
   * - run function
   * - check returned object
   * @expected
   * - error should be false
   * - parts should be undefined
   */
  it('should return undefined parts for undefined value', () => {
    const result = formatDuration(undefined);

    expect(result.error).toBe(false);
    expect(result.parts).toBeUndefined();
  });

  /**
   * @target formatDuration should format 0 ms as 0 seconds
   * @dependencies
   * @scenario
   * - pass 0 as input
   * - run function
   * - check returned object
   * @expected
   * - error should be false
   * - parts should contain 0 second
   */
  it('should format 0 ms as 0 seconds', () => {
    const result = formatDuration(0);

    expect(result.error).toBe(false);
    expect(result.parts).toEqual([{ value: 0, unit: 'second' }]);
  });

  /**
   * @target formatDuration should format milliseconds into two largest units
   * @dependencies
   * @scenario
   * - pass 3_660_000 ms (1 hour + 1 minute)
   * - run function
   * - check returned object
   * @expected
   * - error should be false
   * - parts should contain hour and minute
   */
  it('should format milliseconds into two largest units', () => {
    const result = formatDuration(3_660_000);

    expect(result.error).toBe(false);
    expect(result.parts).toEqual([
      { value: 1, unit: 'hour' },
      { value: 1, unit: 'minute' },
    ]);
  });

  /**
   * @target formatDuration should format only one unit when applicable
   * @dependencies
   * @scenario
   * - pass 30_000 ms (30 seconds)
   * - run function
   * - check returned object
   * @expected
   * - error should be false
   * - parts should contain only seconds
   */
  it('should format only one unit when applicable', () => {
    const result = formatDuration(30_000);

    expect(result.error).toBe(false);
    expect(result.parts).toEqual([{ value: 30, unit: 'second' }]);
  });

  /**
   * @target formatDuration should return error when value produces no parts
   * @dependencies
   * @scenario
   * - pass value less than 1ms (0.5)
   * - run function
   * - check returned object
   * @expected
   * - error should be true
   * - parts should be undefined
   */
  it('should return error when value produces no parts (<1ms)', () => {
    const result = formatDuration(0.5);

    expect(result.error).toBe(true);
    expect(result.parts).toBeUndefined();
  });
});
