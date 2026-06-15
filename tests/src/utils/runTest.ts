import { Expectations, TestCase } from '../types';
import { compare } from './compare';
import { readDB } from './readDB';
import { submitStatus } from './submit';

export const runTest = async (testCase: TestCase) => {
  for (const status of testCase.records) {
    // for parallel requests
    if (Array.isArray(status)) {
      await Promise.all(status.map(submitStatus));
      await new Promise((r) => setTimeout(r, 50));
    } else {
      // for serial requests
      await submitStatus(status);
    }
  }

  const records = await readDB();

  const keys = Object.keys(records) as (keyof Expectations)[];
  for (const key of keys) {
    if (records[key].length !== testCase.expectations[key].length)
      throw new Error(
        `expecting length ${testCase.expectations[key].length} for ${key}, got ${records[key].length}`,
      );

    for (let i = 0; i < testCase.expectations[key].length; i += 1) {
      if (!compare(testCase.expectations[key][i], records[key][i]))
        throw new Error(
          `[${key}] expecting: \n${JSON.stringify(testCase.expectations[key][i], null, 2)}\ngot: \n${JSON.stringify(records[key][i], null, 2)}`,
        );
    }
  }
};
