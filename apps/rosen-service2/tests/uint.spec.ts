import { describe, expect, it } from 'vitest';

import { formatChainName } from '../src/utils';

describe('formatChainName', () => {
  /**
   * @target formatChainName should convert a kebab-case chain name to camelCase by default
   * @scenario
   * - call formatChainName with a kebab-case string
   * - do not provide the mode parameter
   * @expected
   * - it should return the chain name in camelCase format
   */
  it('should convert chain name to camelCase by default', () => {
    const result = formatChainName('cardano-preprod');

    expect(result).toBe('cardanoPreprod');
  });

  /**
   * @target formatChainName should convert a kebab-case chain name to PascalCase
   * @scenario
   * - call formatChainName with a kebab-case string
   * - set mode to "pascal"
   * @expected
   * - it should capitalize the first letter of every part and return PascalCase
   */
  it('should convert chain name to PascalCase', () => {
    const result = formatChainName('cardano-preprod', 'pascal');

    expect(result).toBe('CardanoPreprod');
  });

  /**
   * @target formatChainName should keep a single-part chain name unchanged in camelCase mode
   * @scenario
   * - call formatChainName with a string that contains no hyphens
   * - use the default mode
   * @expected
   * - it should return the original string
   */
  it('should return the same value for a single-part chain name in camel mode', () => {
    const result = formatChainName('cardano');

    expect(result).toBe('cardano');
  });

  /**
   * @target formatChainName should capitalize the first letter of a single-part chain name in PascalCase mode
   * @scenario
   * - call formatChainName with a string that contains no hyphens
   * - set mode to "pascal"
   * @expected
   * - it should return the string with its first letter capitalized
   */
  it('should capitalize a single-part chain name in pascal mode', () => {
    const result = formatChainName('cardano', 'pascal');

    expect(result).toBe('Cardano');
  });

  /**
   * @target should correctly convert chain names with multiple segments
   * @scenario
   * - call formatChainName with a chain name containing several hyphen-separated parts
   * - set mode to "camel"
   * @expected
   * - it should concatenate all parts and capitalize each segment except the first one
   */
  it('should convert multi-segment chain names to camelCase', () => {
    const result = formatChainName('ergo-test-net-chain');

    expect(result).toBe('ergoTestNetChain');
  });
});
