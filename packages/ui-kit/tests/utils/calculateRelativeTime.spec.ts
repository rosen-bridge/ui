import { describe, expect, it } from 'vitest';

import { calculateRelativeTime } from '../../src';

describe('calculateRelativeTime', () => {
  /**
   * @target calculateRelativeTime should return "invalid" for falsy input
   * @dependencies
   * @scenario
   * - call calculateRelativeTime with undefined
   * - check returned object
   * @expected
   * - displayText should be "invalid"
   */
  it('should return invalid for undefined input', () => {
    const result = calculateRelativeTime(undefined);
    expect(result.displayText).toBe('invalid');
    expect(result.prefix).toBeUndefined();
    expect(result.number).toBeUndefined();
  });

  /**
   * @target calculateRelativeTime should return "now" for differences less than 10s
   * @dependencies
   * @scenario
   * - call calculateRelativeTime with timestamp = now ± 5 seconds
   * - check returned object
   * @expected
   * - number should be "now"
   */
  it('should return "now" for differences < 10 seconds', () => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const result1 = calculateRelativeTime(nowSeconds);
    const result2 = calculateRelativeTime(nowSeconds + 5);
    const result3 = calculateRelativeTime(nowSeconds - 5);

    [result1, result2, result3].forEach((res) => {
      expect(res.number).toBe('now');
      expect(res.prefix).toBe('');
      expect(res.unit).toBe('');
    });
  });

  /**
   * @target calculateRelativeTime should return future times correctly
   * @dependencies
   * @scenario
   * - call calculateRelativeTime with timestamp 1 minute in the future
   * - check returned object
   * @expected
   * - prefix should be "in"
   * - number should be "1"
   * - unit should be "minute"
   */
  it('should handle future timestamps correctly', () => {
    const future = new Date(Date.now() + 60_000); // +1 minute
    const result = calculateRelativeTime(future);
    expect(result.prefix).toBe('in');
    expect(result.number).toBe('1');
    expect(result.unit).toBe('minute');
  });

  /**
   * @target calculateRelativeTime should return past times correctly
   * @dependencies
   * @scenario
   * - call calculateRelativeTime with timestamp 1 hour in the past
   * - check returned object
   * @expected
   * - number should be "1"
   * - unit should be "hour ago"
   */
  it('should handle past timestamps correctly', () => {
    const past = new Date(Date.now() - 60 * 60 * 1000); // -1 hour
    const result = calculateRelativeTime(past);
    expect(result.prefix ?? '').toBe('');
    expect(result.number).toBe('1');
    expect(result.unit).toBe('hour ago');
  });

  /**
   * @target calculateRelativeTime should pluralize units correctly
   * @dependencies
   * @scenario
   * - call calculateRelativeTime with timestamp 2 hours in the future
   * - check returned object
   * @expected
   * - unit should be "hours"
   */
  it('should pluralize units for values > 1', () => {
    const future = new Date(Date.now() + 2 * 60 * 60 * 1000); // +2 hours
    const result = calculateRelativeTime(future);
    expect(result.prefix).toBe('in');
    expect(result.number).toBe('2');
    expect(result.unit).toBe('hours');
  });
});
