import { describe, expect, it } from 'vitest';

import { validateCashonizeConnectionConfig } from '../src/config';

describe('validateCashonizeConnectionConfig', () => {
  /**
   * @target validateCashonizeConnectionConfig rejects malformed public relay
   * settings
   * @dependencies None.
   * @scenario
   * - Pass each malformed project ID or deadline to the configuration validator
   * - Check rejection.
   * @expected Reject invalid types, project IDs and deadlines without creating
   *   a session.
   */
  it.each([
    { projectId: 123, timeoutMs: 1000 },
    { projectId: 'invalid', timeoutMs: 1000 },
    { projectId: '12'.repeat(16), timeoutMs: '01000' },
    { projectId: '12'.repeat(16), timeoutMs: '30001' },
    { projectId: '12'.repeat(16), timeoutMs: 0 },
    { projectId: '12'.repeat(16), timeoutMs: 30001 },
    { projectId: '12'.repeat(16), timeoutMs: 1.5 },
  ])('rejects malformed public relay settings', (config) => {
    expect(() => validateCashonizeConnectionConfig(config)).toThrow();
  });
  /**
   * @target validateCashonizeConnectionConfig normalizes a canonical
   * environment deadline
   * @dependencies None.
   * @scenario
   * - Validate a hexadecimal project ID with a canonical string deadline
   * - Check the normalized result.
   * @expected Return the bounded numeric deadline with the project ID
   *   unchanged.
   */
  it('normalizes a canonical environment deadline', () => {
    expect(
      validateCashonizeConnectionConfig({ projectId: '12'.repeat(16), timeoutMs: '30000' }),
    ).toEqual({ projectId: '12'.repeat(16), timeoutMs: 30000 });
  });
});
