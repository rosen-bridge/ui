import {
  AggregateEventStatus,
  AggregateTxStatus,
  Threshold,
} from '@rosen-bridge/public-status-logic';

const getNumber = (key: string): number | undefined => {
  return process.env[key] ? parseFloat(process.env[key]!) : undefined;
};

const getString = (key: string): string => {
  if (!process.env[key]) throw new Error(`env variable ${key} not found`);
  return process.env[key]!;
};

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

export const configs = {
  timeoutThresholdSeconds: getNumber('TIMEOUT_THRESHOLD_SECONDS') ?? 30,
  allowedPks: (process.env['ALLOWED_PKS'] ?? '').split(','),
  postgresUrl: getString('POSTGRES_URL'),
  postgresUseSSL: getString('POSTGRES_USE_SSL') === 'true',
  eventStatusThresholds: getThresholdFromEnv<AggregateEventStatus>(
    'EVENT_STATUS_THRESHOLDS',
  ) ?? [
    { status: AggregateEventStatus.finished, count: 6 },
    { status: AggregateEventStatus.inReward, count: 3 },
    { status: AggregateEventStatus.pendingReward, count: 3 },
    { status: AggregateEventStatus.inPayment, count: 6 },
    { status: AggregateEventStatus.rejected, count: 5 },
    { status: AggregateEventStatus.timeout, count: 5 },
    { status: AggregateEventStatus.reachedLimit, count: 5 },
    { status: AggregateEventStatus.paymentWaiting, count: 5 },
    { status: AggregateEventStatus.rewardWaiting, count: 5 },
    { status: AggregateEventStatus.pendingPayment, count: 3 },
  ],
  txStatusThresholds: getThresholdFromEnv<AggregateTxStatus>(
    'TX_STATUS_THRESHOLDS',
  ) ?? [
    { status: AggregateTxStatus.completed, count: 6 },
    { status: AggregateTxStatus.invalid, count: 6 },
    { status: AggregateTxStatus.sent, count: 6 },
    { status: AggregateTxStatus.signed, count: 3 },
    { status: AggregateTxStatus.inSign, count: 6 },
  ],
};
