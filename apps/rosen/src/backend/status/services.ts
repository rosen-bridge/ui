import { AggregateEventStatus, AggregateTxStatus, type Threshold } from '@rosen-ui/public-status';

import { env } from '@/env';

const thresholdsMapping = {
  requiredParticipants: env.REQUIRED_PARTICIPANTS,
  minimumParticipants: env.MINIMUM_PARTICIPANTS,
  vetoNumber: env.VETO_NUMBER,
};

const customEventThresholdMap = new Map(env.EVENT_STATUS_THRESHOLDS.map((t) => [t.key, t.count]));
const customTxThresholdMap = new Map(env.TX_STATUS_THRESHOLDS.map((t) => [t.key, t.count]));

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
  timeoutThresholdSeconds: env.TIMEOUT_THRESHOLD_SECONDS,
  allowedPks: env.NEXT_PUBLIC_ALLOWED_PKS.map((guard) => guard.key),
  eventStatusThresholds,
  txStatusThresholds,
};
