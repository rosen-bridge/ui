import { PROPERTY_NAME, WrapError, create } from './wrapper';

export class MyError extends WrapError {
  static [PROPERTY_NAME] = 'my-error';
}

export const { wrap, unwrap } = create(MyError);
