import { describe, it, expect } from 'vitest';

import { formatDateTime } from '../../src';

describe('formatDateTime', () => {
  /**
   * @target formatDateTime should return "Invalid DateTime" for undefined input
   * @dependencies
   * @scenario
   * - call formatDateTime with undefined
   * - check returned value
   * @expected
   * - result should be "Invalid DateTime"
   */
  it('should return "Invalid DateTime" for undefined input', () => {
    const result = formatDateTime(undefined);
    expect(result).toBe('Invalid DateTime');
  });

  /**
   * @target formatDateTime should return "Invalid DateTime" for NaN input
   * @dependencies
   * @scenario
   * - call formatDateTime with NaN
   * - check returned value
   * @expected
   * - result should be "Invalid DateTime"
   */
  it('should return "Invalid DateTime" for NaN input', () => {
    const result = formatDateTime(NaN);
    expect(result).toBe('Invalid DateTime');
  });

  /**
   * @target formatDateTime should handle zero timestamp correctly
   * @dependencies
   * @scenario
   * - call formatDateTime with 0 (Unix epoch)
   * - check returned value
   * @expected
   * - result should contain "1970"
   */
  it('should handle zero timestamp correctly', () => {
    const result = formatDateTime(0);
    expect(result).toContain('1970');
  });

  /**
   * @target formatDateTime should format valid timestamp correctly
   * @dependencies
   * @scenario
   * - call formatDateTime with timestamp 1693099992000
   * - check returned value
   * @expected
   * - result should be a non-empty string
   * - result should not be "Invalid DateTime"
   */
  it('should format valid timestamp correctly', () => {
    const timestamp = 1693099992000;
    const result = formatDateTime(timestamp);

    expect(result).toBeTypeOf('string');
    expect(result.length).toBeGreaterThan(0);
    expect(result).not.toBe('Invalid DateTime');
  });

  /**
   * @target formatDateTime should return "Invalid DateTime" for Infinity inputs
   * @dependencies
   * @scenario
   * - call formatDateTime with Infinity
   * - call formatDateTime with -Infinity
   * - check returned value
   * @expected
   * - result should be "Invalid DateTime"
   */
  it('should return "Invalid DateTime" for Infinity input', () => {
    expect(formatDateTime(Infinity)).toBe('Invalid DateTime');
    expect(formatDateTime(-Infinity)).toBe('Invalid DateTime');
  });
});
