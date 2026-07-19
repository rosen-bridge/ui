import {
  AggregateEventStatus,
  AggregateTxStatus,
  type Threshold,
} from '@rosen-ui/public-status';

/**
 * reads the environment variable with the given key and converts it to a Threshold type
 *
 * @param envKey - the key of the environment variable to read
 * @returns the parsed Threshold value or undefined if the environment variable is not defined
 * @throws will throw an error if the JSON is invalid, or if the parsed value does not match the Threshold type
 */
export const getThresholdFromEnv = <T>(
  envKey: string,
): Threshold<T>[] | undefined => {
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

  // Validate each element has a string 'key' and a number 'count'
  for (const [index, item] of parsed.entries()) {
    if (
      typeof item !== 'object' ||
      item === null ||
      !('key' in item) ||
      !('count' in item) ||
      typeof item.key !== 'string' ||
      typeof item.count !== 'number'
    ) {
      throw new Error(
        `Invalid format in environment variable ${envKey} at index ${index}: each item must be an object with string 'key' and number 'count'.`,
      );
    }
  }

  // Use type assertion because we've validated the structure.
  return parsed as Threshold<T>[];
};

const getNumber = (key: string): number | undefined => {
  return process.env[key] ? parseFloat(process.env[key]!) : undefined;
};

const thresholdsMapping = {
  requiredParticipants: getNumber('REQUIRED_PARTICIPANTS') ?? 6,
  minimumParticipants: getNumber('MINIMUM_PARTICIPANTS') ?? 1,
  vetoNumber: getNumber('VETO_NUMBER') ?? 5,
};

const customEventThresholds = getThresholdFromEnv<AggregateEventStatus>(
  'EVENT_STATUS_THRESHOLDS',
);
const customTxThresholds = getThresholdFromEnv<AggregateTxStatus>(
  'TX_STATUS_THRESHOLDS',
);

const customEventThresholdMap = new Map(
  customEventThresholds?.map((t) => [t.key, t.count]) ?? [],
);
const customTxThresholdMap = new Map(
  customTxThresholds?.map((t) => [t.key, t.count]) ?? [],
);

const defaultEventStatusMapping: Threshold<AggregateEventStatus>[] = [
  {
    key: AggregateEventStatus.finished,
    count: thresholdsMapping.minimumParticipants,
  },
  {
    key: AggregateEventStatus.inReward,
    count: thresholdsMapping.requiredParticipants,
  },
  {
    key: AggregateEventStatus.pendingReward,
    count: thresholdsMapping.minimumParticipants,
  },
  {
    key: AggregateEventStatus.inPayment,
    count: thresholdsMapping.requiredParticipants,
  },
  { key: AggregateEventStatus.rejected, count: thresholdsMapping.vetoNumber },
  { key: AggregateEventStatus.timeout, count: thresholdsMapping.vetoNumber },
  {
    key: AggregateEventStatus.reachedLimit,
    count: thresholdsMapping.vetoNumber,
  },
  {
    key: AggregateEventStatus.paymentWaiting,
    count: thresholdsMapping.vetoNumber,
  },
  {
    key: AggregateEventStatus.rewardWaiting,
    count: thresholdsMapping.vetoNumber,
  },
  {
    key: AggregateEventStatus.pendingPayment,
    count: thresholdsMapping.minimumParticipants,
  },
];

const defaultTxStatusMapping: Threshold<AggregateTxStatus>[] = [
  {
    key: AggregateTxStatus.completed,
    count: thresholdsMapping.minimumParticipants,
  },
  { key: AggregateTxStatus.invalid, count: thresholdsMapping.vetoNumber },
  {
    key: AggregateTxStatus.sent,
    count: thresholdsMapping.requiredParticipants,
  },
  {
    key: AggregateTxStatus.signed,
    count: thresholdsMapping.minimumParticipants,
  },
  {
    key: AggregateTxStatus.inSign,
    count: thresholdsMapping.requiredParticipants,
  },
];

const eventStatusThresholds = defaultEventStatusMapping.map((status) => {
  const customCount = customEventThresholdMap.get(status.key);
  return { key: status.key, count: customCount ?? status.count };
});

const txStatusThresholds = defaultTxStatusMapping.map((status) => {
  const customCount = customTxThresholdMap.get(status.key);
  return { key: status.key, count: customCount ?? status.count };
});

export const publicStatusConfigs = {
  timeoutThresholdSeconds: getNumber('TIMEOUT_THRESHOLD_SECONDS') ?? 30,
  allowedPks: (
    JSON.parse(process.env['NEXT_PUBLIC_ALLOWED_PKS'] ?? '[]') as Array<{
      key: string;
      label: string;
    }>
  ).map((guard) => guard.key),
  eventStatusThresholds,
  txStatusThresholds,
};
