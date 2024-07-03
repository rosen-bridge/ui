'use server';

import { MyError, wrap } from './config';

const serverAction = async (
  param1: string,
  param2: number,
): Promise<number[]> => {
  if (Math.random() > 0.5) {
    throw new MyError('this is a message');
  }
  return [1];
};
export const serverActionWrapped = wrap(serverAction);

// const clientAction = unwrap(serverActionWrapped);
// const result = await clientAction('param1', 5);
