import { describe, expect, it } from 'vitest';

import { mergeSlots } from '../../src/utils/mergeSlots';

describe('mergeSlots', () => {
  /**
   * @target mergeSlots should return undefined when no source has slots
   * @dependencies
   * @scenario
   * - pass only undefined sources
   * - run function
   * - check returned value
   * @expected
   * - result should be undefined
   */
  it('should return undefined when no source has slots', () => {
    const result = mergeSlots(undefined, undefined, undefined);

    expect(result).toBeUndefined();
  });

  /**
   * @target mergeSlots should keep the props of the same slot from every source
   * @dependencies
   * @scenario
   * - pass a default source with `icon.color`
   * - pass an inline source with `icon.size`
   * - run function
   * - check returned value
   * @expected
   * - `icon` should contain both `color` and `size`
   */
  it('should keep the props of the same slot from every source', () => {
    const result = mergeSlots({ icon: { color: 'text-secondary' } }, { icon: { size: 'small' } });

    expect(result).toEqual({ icon: { color: 'text-secondary', size: 'small' } });
  });

  /**
   * @target mergeSlots should let the higher priority source win on the same prop
   * @dependencies
   * @scenario
   * - pass default, preset and inline sources that all set `label.variant`
   * - run function
   * - check returned value
   * @expected
   * - `label.variant` should come from the inline source
   * - `label.color` from the default source should be kept
   */
  it('should let the higher priority source win on the same prop', () => {
    const result = mergeSlots(
      { label: { color: 'primary', variant: 'body1' } },
      { label: { variant: 'body2' } },
      { label: { variant: 'caption' } },
    );

    expect(result).toEqual({ label: { color: 'primary', variant: 'caption' } });
  });

  /**
   * @target mergeSlots should keep slots that appear in only one source
   * @dependencies
   * @scenario
   * - pass a default source with `logo`
   * - pass an inline source with `label`
   * - run function
   * - check returned value
   * @expected
   * - both `logo` and `label` should be present
   */
  it('should keep slots that appear in only one source', () => {
    const result = mergeSlots({ logo: { size: 'large' } }, undefined, {
      label: { color: 'error' },
    });

    expect(result).toEqual({ logo: { size: 'large' }, label: { color: 'error' } });
  });

  /**
   * @target mergeSlots should ignore an undefined slot in a higher priority source
   * @dependencies
   * @scenario
   * - pass a default source with `icon.color`
   * - pass an inline source with `icon: undefined`
   * - run function
   * - check returned value
   * @expected
   * - `icon` should keep the props of the default source
   */
  it('should ignore an undefined slot in a higher priority source', () => {
    const result = mergeSlots({ icon: { color: 'text-secondary' } }, { icon: undefined });

    expect(result).toEqual({ icon: { color: 'text-secondary' } });
  });

  /**
   * @target mergeSlots should not mutate the sources
   * @dependencies
   * @scenario
   * - pass two sources with the same slot
   * - run function
   * - check the sources
   * @expected
   * - both sources should stay unchanged
   */
  it('should not mutate the sources', () => {
    const defaults = { icon: { color: 'text-secondary' } };
    const inline = { icon: { size: 'small' } };

    mergeSlots(defaults, inline);

    expect(defaults).toEqual({ icon: { color: 'text-secondary' } });
    expect(inline).toEqual({ icon: { size: 'small' } });
  });
});
