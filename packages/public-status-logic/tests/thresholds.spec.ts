import { getThresholdFromEnv } from '../src/thresholds';

describe('getThresholdFromEnv', () => {
  const envKey = 'TEST_THRESHOLD';

  // backup original process.env
  const ORIGINAL_ENV = { ...process.env };

  beforeEach(() => {
    // reset process.env before each test
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    // restore process.env after each test
    process.env = { ...ORIGINAL_ENV };
  });

  /**
   * @target getThresholdFromEnv should return undefined when the environment variable is not defined
   * @dependencies
   * @scenario
   * - ensure that process.env does not contain the key for the environment variable
   * - call getThresholdFromEnv with the given key
   * @expected
   * - the returned value should have been equal to undefined
   */
  it('should return undefined when the environment variable is not defined', () => {
    // arrange
    delete process.env[envKey];

    // act
    const result = getThresholdFromEnv(envKey);

    // assert
    expect(result).toBeUndefined();
  });

  /**
   * @target getThresholdFromEnv should successfully parse a valid JSON string representing a correct Threshold array
   * @dependencies
   * @scenario
   * - stub process.env to return a valid JSON string such as `[{"status":"valid", "count":10}]`
   * - call getThresholdFromEnv with the given key
   * @expected
   * - the returned value should have been equal to the array `[{ status: 'valid', count: 10 }]`
   */
  it('should successfully parse a valid JSON string representing a correct Threshold array', () => {
    // arrange
    process.env[envKey] = JSON.stringify([
      { status: 'valid', count: 10 },
      { status: 'valid2', count: 11 },
    ]);

    // act
    const result = getThresholdFromEnv(envKey);

    // assert
    expect(result).toEqual([
      { status: 'valid', count: 10 },
      { status: 'valid2', count: 11 },
    ]);
  });

  /**
   * @target getThresholdFromEnv should throw an error when the environment variable contains an invalid or mis-formatted JSON string
   * @dependencies
   * @scenario
   * - stub process.env to return an invalid or mis-formatted JSON string such as `"[{}]"`
   * - call getThresholdFromEnv with the given key
   * @expected
   * - an error should have been thrown stating that the validation failed
   */
  it('should throw an error when the environment variable contains an invalid or mis-formatted JSON string', () => {
    // arrange
    process.env[envKey] = JSON.stringify([{}]);

    // act & assert
    expect(() => getThresholdFromEnv(envKey)).toThrowError(
      new RegExp(`Invalid format in environment variable ${envKey} at index 0`),
    );
  });

  /**
   * @target getThresholdFromEnv should throw an error when the array contains a mix of valid and invalid objects
   * @dependencies
   * @scenario
   * - stub process.env to return a valid JSON string representing an array such as `[{"status":"valid", "count":5}, {"status": "invalid", "count": "no-number"}]`
   * - call getThresholdFromEnv with the given key
   * @expected
   * - an error should have been thrown indicating the index of the invalid item and the specific type mismatch
   */
  it('should throw an error when the array contains a mix of valid and invalid objects', () => {
    // arrange
    process.env[envKey] = JSON.stringify([
      { status: 'valid', count: 5 },
      { status: 'invalid', count: 'no-number' },
    ]);

    // act & assert
    expect(() => getThresholdFromEnv(envKey)).toThrowError(
      new RegExp(`Invalid format in environment variable ${envKey} at index 1`),
    );
  });
});
