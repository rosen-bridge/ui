import { create } from './core';

const KEY = '__TYPE__';

export class MyError extends Error {
  static [KEY] = 'my-error';
}

export const { wrap, unwrap } = create(KEY, [MyError]);
