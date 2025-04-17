import { AggregateEventStatus, AggregateTxStatus } from './constants';
import { Threshold } from './types';

/**
 * reads the environment variable with the given key and converts it to a Threshold type
 *
 * @param envKey - the key of the environment variable to read
 * @returns the parsed Threshold value or undefined if the environment variable is not defined
 * @throws will throw an error if the JSON is invalid, or if the parsed value does not match the Threshold type
 */
export const getThresholdFromEnv = <T>(
  envKey: string,
): Threshold<T> | undefined => {
  const envValue = process.env[envKey];

  if (!envValue) {
    return;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(envValue);
  } catch (err) {
    throw new Error(
      `Failed to parse JSON from environment variable ${envKey}: ${err}`,
    );
  }

  // Validate that `parsed` matches the Threshold type.
  if (!Array.isArray(parsed)) {
    throw new Error(
      `Expected an array for environment variable ${envKey} but got ${typeof parsed}.`,
    );
  }

  // Validate each element has a string 'status' and a number 'count'
  for (const [index, item] of parsed.entries()) {
    if (
      typeof item !== 'object' ||
      item === null ||
      !('status' in item) ||
      !('count' in item) ||
      typeof item.status !== 'string' ||
      typeof item.count !== 'number'
    ) {
      throw new Error(
        `Invalid format in environment variable ${envKey} at index ${index}: each item must be an object with string 'status' and number 'count'.`,
      );
    }
  }

  // Use type assertion because we've validated the structure.
  return parsed as Threshold<T>;
};

export const eventStatusThresholds: Threshold<AggregateEventStatus> =
  getThresholdFromEnv('EVENT_STATUS_THRESHOLDS') ?? [
    { status: AggregateEventStatus.finished, count: 6 },
    { status: AggregateEventStatus.inReward, count: 3 },
    { status: AggregateEventStatus.pendingReward, count: 3 },
    { status: AggregateEventStatus.inPayment, count: 6 },
    { status: AggregateEventStatus.rejected, count: 5 },
    { status: AggregateEventStatus.timeout, count: 5 },
    { status: AggregateEventStatus.reachedLimit, count: 5 },
    { status: AggregateEventStatus.paymentWaiting, count: 5 },
    { status: AggregateEventStatus.pendingPayment, count: 3 },
  ];
export const txStatusThresholds: Threshold<AggregateTxStatus> =
  getThresholdFromEnv('TX_STATUS_THRESHOLDS') ?? [
    { status: AggregateTxStatus.completed, count: 6 },
    { status: AggregateTxStatus.invalid, count: 6 },
    { status: AggregateTxStatus.sent, count: 6 },
    { status: AggregateTxStatus.signed, count: 3 },
    { status: AggregateTxStatus.inSign, count: 6 },
  ];
