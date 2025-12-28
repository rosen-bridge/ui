import { describe, it, expect } from 'vitest';

import { formatAmount } from '../../src';

describe('', () => {
  it('', () => {
    expect(formatAmount()).toBe(undefined);
  });

  it('', () => {
    expect(() => formatAmount('')).toThrowError();
  });

  it('', () => {
    expect(() => formatAmount(' ')).toThrowError();
  });

  it('', () => {
    expect(() => formatAmount('hi')).toThrowError();
  });

  it('', () => {
    expect(() => formatAmount('1234h')).toThrowError();
  });

  it('', () => {
    expect(() => formatAmount('1234.56k78')).toThrowError();
  });

  it('', () => {
    expect(() => formatAmount(NaN)).toThrowError();
  });

  it('', () => {
    expect(formatAmount(1)).toEqual({
      fraction: '0',
      number: '1',
      tooltip: '1',
      unit: undefined,
      zeros: undefined,
    });
  });

  it('', () => {
    expect(formatAmount(12345)).toEqual({
      fraction: '0',
      number: '12',
      tooltip: '12,345',
      unit: 'K',
      zeros: undefined,
    });
  });

  it('', () => {
    expect(formatAmount('12345')).toEqual({
      fraction: '0',
      number: '12',
      tooltip: '12,345',
      unit: 'K',
      zeros: undefined,
    });
  });

  it('', () => {
    expect(formatAmount(12345n)).toEqual({
      fraction: '0',
      number: '12',
      tooltip: '12,345',
      unit: 'K',
      zeros: undefined,
    });
  });

  it('', () => {
    expect(formatAmount(123654)).toEqual({
      fraction: '0',
      number: '124',
      tooltip: '123,654',
      unit: 'K',
      zeros: undefined,
    });
  });

  it('', () => {
    expect(formatAmount('3e-12')).toEqual({
      fraction: '000000000003',
      number: '0',
      tooltip: '0.000000000003',
      unit: undefined,
      zeros: undefined,
    });
  });

  it('', () => {
    expect(formatAmount('1234.')).toEqual({
      fraction: '0',
      number: '1',
      tooltip: '1,234',
      unit: 'K',
      zeros: undefined,
    });
  });
});
