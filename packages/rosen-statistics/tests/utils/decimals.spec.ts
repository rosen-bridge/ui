import { describe, expect, it } from 'vitest';

import {
  getDecimalString,
  getNonDecimalString,
  getNumberOfDecimals,
  multiplyByPowerOfTen,
  scientificToString,
} from '../../lib/utils';

describe('getDecimalString', () => {
  /**
   * @target getDecimalString should handle basic decimal conversion with various input types
   * @scenario
   * - Call function with string, number, and bigint inputs
   * - Test with different decimal places
   * @expected
   * - Returns correct decimal string representation for all input types
   */
  it('should handle basic decimal conversion with various input types', () => {
    expect(getDecimalString('123', 2)).toBe('1.23');
    expect(getDecimalString('1230', 2)).toBe('12.3');
    expect(getDecimalString('123456', 2)).toBe('1234.56');

    expect(getDecimalString(123, 2)).toBe('1.23');
    expect(getDecimalString(1230, 2)).toBe('12.3');

    expect(getDecimalString(123n, 2)).toBe('1.23');
    expect(getDecimalString(1230n, 2)).toBe('12.3');
  });

  /**
   * @target getDecimalString should handle padding with leading zeros when value length <= decimals
   * @scenario
   * - Provide values that are shorter than the decimal places
   * @expected
   * - Returns string with leading zeros after decimal point
   */
  it('should handle padding with leading zeros when value length <= decimals', () => {
    expect(getDecimalString('1', 2)).toBe('0.01');
    expect(getDecimalString('12', 3)).toBe('0.012');
    expect(getDecimalString('5', 4)).toBe('0.0005');
  });

  /**
   * @target getDecimalString should trim trailing zeros and decimal point
   * @scenario
   * - Provide values that result in trailing zeros
   * @expected
   * - Returns string with trailing zeros and decimal point trimmed
   */
  it('should trim trailing zeros and decimal point', () => {
    expect(getDecimalString('1000', 2)).toBe('10');
    expect(getDecimalString('12300', 2)).toBe('123');
    expect(getDecimalString('1200', 3)).toBe('1.2');
    expect(getDecimalString('1000', 3)).toBe('1');
  });

  /**
   * @target getDecimalString should return original string when decimals is 0 or undefined
   * @scenario
   * - Call with decimals = 0
   * - Call with decimals = undefined
   * @expected
   * - Returns original value string without modification
   */
  it('should return original string when decimals is 0 or undefined', () => {
    expect(getDecimalString('123', 0)).toBe('123');
    expect(getDecimalString('123', undefined)).toBe('123');
    expect(getDecimalString(123n, 0)).toBe('123');
  });

  /**
   * @target getDecimalString should handle edge cases with very large numbers
   * @scenario
   * - Provide very large bigint values
   * @expected
   * - Correctly formats large numbers without precision loss
   */
  it('should handle edge cases with very large numbers', () => {
    expect(getDecimalString('12345678901234567890', 8)).toBe(
      '123456789012.3456789',
    );
    expect(getDecimalString(12345678901234567890n, 18)).toBe(
      '12.34567890123456789',
    );
  });
});

describe('getNonDecimalString', () => {
  /**
   * @target getNonDecimalString should convert decimal string to integer string
   * @scenario
   * - Provide decimal strings with various formats
   * @expected
   * - Returns integer string without decimal point
   */
  it('should convert decimal string to integer string', () => {
    expect(getNonDecimalString('1.23', 2)).toBe('123');
    expect(getNonDecimalString('12.3', 2)).toBe('1230');
    expect(getNonDecimalString('0.01', 2)).toBe('1');
    expect(getNonDecimalString('123.456', 3)).toBe('123456');
  });

  /**
   * @target getNonDecimalString should handle numbers without decimal point
   * @scenario
   * - Provide integer strings without decimal point
   * @expected
   * - Appends zeros based on decimals parameter
   */
  it('should handle numbers without decimal point', () => {
    expect(getNonDecimalString('123', 2)).toBe('12300');
    expect(getNonDecimalString('456', 3)).toBe('456000');
    expect(getNonDecimalString('789', 0)).toBe('789');
  });

  /**
   * @target getNonDecimalString should handle various input types
   * @scenario
   * - Provide string, number, and bigint inputs
   * @expected
   * - Returns correct integer string for all input types
   */
  it('should handle various input types', () => {
    expect(getNonDecimalString('1.23', 2)).toBe('123');
    expect(getNonDecimalString(1.23, 2)).toBe('123');
    expect(getNonDecimalString(123n, 2)).toBe('12300');
  });

  /**
   * @target getNonDecimalString should pad with zeros when fractional part is shorter than decimals
   * @scenario
   * - Provide values with fractional part shorter than decimals parameter
   * @expected
   * - Appends zeros to reach required decimal length
   */
  it('should pad with zeros when fractional part is shorter than decimals', () => {
    expect(getNonDecimalString('1.2', 3)).toBe('1200');
    expect(getNonDecimalString('12.3', 4)).toBe('123000');
    expect(getNonDecimalString('0.5', 6)).toBe('500000');
  });

  /**
   * @target getNonDecimalString should handle edge cases with empty or zero values
   * @dependencies
   * - getNonDecimalString utility
   * @scenario
   * - Provide empty string, zero, or falsy values
   * @expected
   * - Returns appropriate string representations
   */
  it('should handle edge cases with empty or zero values', () => {
    expect(getNonDecimalString('', 2)).toBe('0');
    expect(getNonDecimalString(0, 2)).toBe('0');
    expect(getNonDecimalString('0', 2)).toBe('0');
    expect(getNonDecimalString('0.0', 2)).toBe('0');
  });

  /**
   * @target getNonDecimalString should remove leading zeros from result
   * @dependencies
   * - getNonDecimalString utility
   * @scenario
   * - Provide values that would result in leading zeros
   * @expected
   * - Returns string with leading zeros removed
   */
  it('should remove leading zeros from result', () => {
    expect(getNonDecimalString('0.01', 2)).toBe('1');
    expect(getNonDecimalString('0.001', 3)).toBe('1');
    expect(getNonDecimalString('00.123', 3)).toBe('123');
  });
});

describe('getNumberOfDecimals', () => {
  /**
   * @target getNumberOfDecimals should count decimal places in a string
   * @dependencies
   * - getNumberOfDecimals utility
   * @scenario
   * - Provide strings with various numbers of decimal places
   * @expected
   * - Returns correct count of decimal digits
   */
  it('should count decimal places in a string', () => {
    expect(getNumberOfDecimals('123')).toBe(0);
    expect(getNumberOfDecimals('123.4')).toBe(1);
    expect(getNumberOfDecimals('123.45')).toBe(2);
    expect(getNumberOfDecimals('123.456789')).toBe(6);
  });

  /**
   * @target getNumberOfDecimals should return 0 for invalid or empty inputs
   * @scenario
   * - Provide undefined, empty string, or string without decimal point
   * @expected
   * - Returns 0
   */
  it('should return 0 for invalid or empty inputs', () => {
    expect(getNumberOfDecimals('')).toBe(0);
    expect(getNumberOfDecimals('abc')).toBe(0);
    expect(getNumberOfDecimals('123.')).toBe(0);
  });

  /**
   * @target getNumberOfDecimals should handle edge cases with trailing zeros
   * @dependencies
   * - getNumberOfDecimals utility
   * @scenario
   * - Provide strings with trailing zeros after decimal
   * @expected
   * - Counts all digits including trailing zeros
   */
  it('should handle edge cases with trailing zeros', () => {
    expect(getNumberOfDecimals('123.0')).toBe(1);
    expect(getNumberOfDecimals('123.00')).toBe(2);
    expect(getNumberOfDecimals('123.000')).toBe(3);
  });
});

describe('scientificToString', () => {
  /**
   * @target scientificToString should convert positive scientific notation to decimal string
   * @scenario
   * - Provide positive exponents in scientific notation (e.g., 4e12)
   * @expected
   * - Returns full decimal string without scientific notation
   */
  it('should convert positive scientific notation to decimal string', () => {
    expect(scientificToString('4e12')).toBe('4000000000000');
    expect(scientificToString(4e12)).toBe('4000000000000');
    expect(scientificToString('1.23e5')).toBe('123000');
    expect(scientificToString('1.23e+5')).toBe('123000');
  });

  /**
   * @target scientificToString should convert negative scientific notation to decimal string
   * @dependencies
   * - scientificToString utility
   * @scenario
   * - Provide negative exponents in scientific notation (e.g., 2e-15)
   * @expected
   * - Returns full decimal string with leading zeros
   */
  it('should convert negative scientific notation to decimal string', () => {
    expect(scientificToString('2e-15')).toBe('0.000000000000002');
    expect(scientificToString(2e-15)).toBe('0.000000000000002');
    expect(scientificToString('1.23e-3')).toBe('0.00123');
    expect(scientificToString('1.23e-5')).toBe('0.0000123');
  });

  /**
   * @target scientificToString should handle regular decimal strings without conversion
   * @scenario
   * - Provide regular decimal strings without scientific notation
   * @expected
   * - Returns the original string unchanged
   */
  it('should handle regular decimal strings without conversion', () => {
    expect(scientificToString('123.456')).toBe('123.456');
    expect(scientificToString('0.001')).toBe('0.001');
    expect(scientificToString('1000')).toBe('1000');
  });

  /**
   * @target scientificToString should handle various input types
   * @scenario
   * - Provide number, string, and undefined inputs
   * @expected
   * - Returns appropriate string representation for each input type
   */
  it('should handle various input types', () => {
    expect(scientificToString(1e-10)).toBe('0.0000000001');
    expect(scientificToString('1e-10')).toBe('0.0000000001');
    expect(scientificToString(undefined)).toBe('0');
  });

  /**
   * @target scientificToString should handle edge cases with very small numbers
   * @scenario
   * - Provide extremely small numbers in scientific notation
   * @expected
   * - Returns correct decimal string with many leading zeros
   */
  it('should handle edge cases with very small numbers', () => {
    expect(scientificToString('1e-20')).toBe('0.00000000000000000001');
    expect(scientificToString('1.234e-10')).toBe('0.0000000001234');
    expect(scientificToString('9.999e-99')).toMatch(/^0\.0+9999$/);
  });

  /**
   * @target scientificToString should handle edge cases with very large numbers
   * @scenario
   * - Provide extremely large numbers in scientific notation
   * @expected
   * - Returns correct decimal string with many trailing zeros
   */
  it('should handle edge cases with very large numbers', () => {
    expect(scientificToString('1e20')).toBe('100000000000000000000');
    expect(scientificToString('1.234e10')).toBe('12340000000');
    expect(scientificToString('9.999e99')).toMatch(/^9999+0+$/);
  });

  /**
   * @target scientificToString should handle negative numbers in scientific notation
   * @scenario
   * - Provide negative numbers in scientific notation
   * @expected
   * - Returns correct decimal string with negative sign preserved
   */
  it('should handle negative numbers in scientific notation', () => {
    expect(scientificToString('-4e12')).toBe('-4000000000000');
    expect(scientificToString('-2e-15')).toBe('-0.000000000000002');
    expect(scientificToString('-1.23e5')).toBe('-123000');
  });

  /**
   * @target scientificToString should trim trailing zeros after decimal point
   * @scenario
   * - Provide numbers that result in trailing zeros after decimal
   * @expected
   * - Returns string with trailing zeros trimmed
   */
  it('should trim trailing zeros after decimal point', () => {
    expect(scientificToString('1.2300e02')).toBe('123');
    expect(scientificToString('1.200e1')).toBe('12');
    expect(scientificToString('1.000e-3')).toBe('0.001');
  });

  /**
   * @target scientificToString should handle zero and edge cases
   * @scenario
   * - Provide zero or empty values
   * @expected
   * - Returns appropriate zero representation
   */
  it('should handle zero and edge cases', () => {
    expect(scientificToString(0)).toBe('0');
    expect(scientificToString('0')).toBe('0');
    expect(scientificToString('0e10')).toBe('0');
    expect(scientificToString('0e-10')).toBe('0');
  });
});

describe('multiplyByPowerOfTen', () => {
  /**
   * @target multiplyByPowerOfTen should multiply string values by 10^power
   * @scenario
   * - Provide numeric strings with various powers
   * @expected
   * - Returns normalized numeric string multiplied by power of ten
   */
  it('should multiply string values by power of ten', () => {
    expect(multiplyByPowerOfTen('1', 1)).toBe('10');
    expect(multiplyByPowerOfTen('12', 2)).toBe('1200');
    expect(multiplyByPowerOfTen('123', 5)).toBe('12300000');
  });

  /**
   * @target multiplyByPowerOfTen should multiply bigint values by 10^power
   * @scenario
   * - Provide bigint inputs with various powers
   * @expected
   * - Returns correct normalized string representation
   */
  it('should multiply bigint values by power of ten', () => {
    expect(multiplyByPowerOfTen(1n, 3)).toBe('1000');
    expect(multiplyByPowerOfTen(45n, 2)).toBe('4500');
    expect(multiplyByPowerOfTen(123456n, 4)).toBe('1234560000');
  });

  /**
   * @target multiplyByPowerOfTen should normalize leading zeros in input
   * @scenario
   * - Provide values with leading zeros
   * @expected
   * - Removes leading zeros in the final result
   */
  it('should normalize leading zeros in input', () => {
    expect(multiplyByPowerOfTen('00123', 2)).toBe('12300');
    expect(multiplyByPowerOfTen('0000', 5)).toBe('0');
    expect(multiplyByPowerOfTen('00045', 0)).toBe('45');
  });

  /**
   * @target multiplyByPowerOfTen should return original normalized value when power is zero
   * @scenario
   * - Call function with power = 0
   * @expected
   * - Returns normalized original value
   */
  it('should return original normalized value when power is zero', () => {
    expect(multiplyByPowerOfTen('00123', 0)).toBe('123');
    expect(multiplyByPowerOfTen(123n, 0)).toBe('123');
  });

  /**
   * @target multiplyByPowerOfTen should handle negative power values safely
   * @scenario
   * - Call function with negative power
   * @expected
   * - Returns normalized original value without modification
   */
  it('should handle negative power values safely', () => {
    expect(multiplyByPowerOfTen('00123', -3)).toBe('123');
    expect(multiplyByPowerOfTen(123n, -1)).toBe('123');
  });

  /**
   * @target multiplyByPowerOfTen should handle zero values correctly
   * @scenario
   * - Provide zero as string or bigint with various powers
   * @expected
   * - Always returns "0"
   */
  it('should handle zero values correctly', () => {
    expect(multiplyByPowerOfTen('0', 5)).toBe('0');
    expect(multiplyByPowerOfTen('0000', 10)).toBe('0');
    expect(multiplyByPowerOfTen(0n, 3)).toBe('0');
  });

  /**
   * @target multiplyByPowerOfTen should handle very large powers
   * @scenario
   * - Provide large power values
   * @expected
   * - Returns correctly normalized numeric string
   */
  it('should handle very large powers', () => {
    const result = multiplyByPowerOfTen('1', 50);
    expect(result).toBe(`1${'0'.repeat(50)}`);
  });
});
