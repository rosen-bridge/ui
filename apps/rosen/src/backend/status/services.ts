import {
  AggregatedStatusChangedEntity,
  GuardStatusChangedEntity,
  AggregatedStatusEntity,
  Utils,
  Threshold,
  AggregateEventStatus,
  AggregateTxStatus,
} from '@rosen-ui/public-status';

/**
 * a response type used in api
 */
export type AggregatedStatusChangedDTO = Omit<
  AggregatedStatusChangedEntity,
  'id' | 'eventId'
>;

/**
 * helper function to map AggregatedStatusChangedEntity to its DTO
 * @param record
 * @returns AggregatedStatusChangedDTO
 */
export const aggregatedStatusChangedToDTO = (
  record: AggregatedStatusChangedEntity,
): AggregatedStatusChangedDTO => {
  return Utils.cloneOmitting(record, ['id', 'eventId']);
};

/**
 * a response type used in api
 */
export type AggregatedStatusDTO = Omit<AggregatedStatusEntity, 'eventId'>;

/**
 * helper function to map AggregatedStatusEntity to its DTO
 * @param record
 * @returns AggregatedStatusDTO
 */
export const aggregatedStatusToDTO = (
  record: AggregatedStatusEntity,
): AggregatedStatusDTO => {
  return Utils.cloneOmitting(record, ['eventId']);
};

/**
 * a response type used in api
 */
export type GuardStatusChangedDTO = Omit<
  GuardStatusChangedEntity,
  'id' | 'eventId'
>;

/**
 * helper function to map GuardStatusChangedEntity to its DTO
 * @param record
 * @returns GuardStatusChangedDTO
 */
export const guardStatusChangedToDTO = (
  record: GuardStatusChangedEntity,
): GuardStatusChangedDTO => {
  return Utils.cloneOmitting(record, ['id', 'eventId']);
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

const defaultEventStatusMapping: Partial<Record<AggregateEventStatus, number>> =
  {
    [AggregateEventStatus.finished]: thresholdsMapping.minimumParticipants,
    [AggregateEventStatus.inReward]: thresholdsMapping.requiredParticipants,
    [AggregateEventStatus.pendingReward]: thresholdsMapping.minimumParticipants,
    [AggregateEventStatus.inPayment]: thresholdsMapping.requiredParticipants,
    [AggregateEventStatus.rejected]: thresholdsMapping.vetoNumber,
    [AggregateEventStatus.timeout]: thresholdsMapping.vetoNumber,
    [AggregateEventStatus.reachedLimit]: thresholdsMapping.vetoNumber,
    [AggregateEventStatus.paymentWaiting]: thresholdsMapping.vetoNumber,
    [AggregateEventStatus.rewardWaiting]: thresholdsMapping.vetoNumber,
    [AggregateEventStatus.pendingPayment]:
      thresholdsMapping.minimumParticipants,
  };

const defaultTxStatusMapping: Record<AggregateTxStatus, number> = {
  [AggregateTxStatus.completed]: thresholdsMapping.minimumParticipants,
  [AggregateTxStatus.invalid]: thresholdsMapping.vetoNumber,
  [AggregateTxStatus.sent]: thresholdsMapping.requiredParticipants,
  [AggregateTxStatus.signed]: thresholdsMapping.minimumParticipants,
  [AggregateTxStatus.inSign]: thresholdsMapping.requiredParticipants,
};

const eventStatusThresholds = Object.values(AggregateEventStatus)
  .filter((status) => status !== AggregateEventStatus.waitingForConfirmation)
  .map((status) => {
    const customCount = customEventThresholdMap.get(status);
    if (customCount !== undefined) {
      return { key: status, count: customCount };
    }
    const count = defaultEventStatusMapping[status];
    if (count === undefined)
      throw new Error(
        `Missing default threshold mapping for event status: ${status}`,
      );
    return { key: status, count };
  });

const txStatusThresholds = Object.values(AggregateTxStatus).map((status) => {
  const customCount = customTxThresholdMap.get(status);
  if (customCount !== undefined) {
    return { key: status, count: customCount };
  }
  const count = defaultTxStatusMapping[status];
  return { key: status, count };
});

export const publicStatusConfigs = {
  timeoutThresholdSeconds: getNumber('TIMEOUT_THRESHOLD_SECONDS') ?? 30,
  allowedPks: (process.env['ALLOWED_PKS'] ?? '').split(','),
  eventStatusThresholds,
  txStatusThresholds,
};
