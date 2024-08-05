import { create } from './core';

const KEY = '__TYPE__';

export class ValidationError extends Error {
  static [KEY] = 'validation-error';
}

export const { wrap, unwrap } = create(KEY, [ValidationError]);
