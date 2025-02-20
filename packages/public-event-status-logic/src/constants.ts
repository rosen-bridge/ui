export enum TxType {
  payment = 'payment',
  reward = 'reward',
}

export enum EventStatus {
  pendingPayment = 'pending-payment',
  pendingReward = 'pending-reward',
  inPayment = 'in-payment',
  inReward = 'in-reward',
  completed = 'completed',
  spent = 'spent', // completed with unknown process
  rejected = 'rejected',
  timeout = 'timeout',
  reachedLimit = 'reached-limit',
  paymentWaiting = 'payment-waiting',
  rewardWaiting = 'reward-waiting',
}

export enum TxStatus {
  approved = 'approved',
  inSign = 'in-sign',
  signFailed = 'sign-failed',
  signed = 'signed',
  sent = 'sent',
  invalid = 'invalid',
}

export enum AggregateEventStatus {
  finished = 'finished', // completed, spent
  inReward = 'in-reward',
  pendingReward = 'pending-reward',
  inPayment = 'in-payment',
  rejected = 'rejected',
  timeout = 'timeout',
  reachedLimit = 'reached-limit',
  paymentWaiting = 'payment-waiting',
  rewardWaiting = 'reward-waiting',
  pendingPayment = 'pending-payment',
  waitingForConfirmation = 'waiting-for-confirmation',
}

export enum AggregateTxStatus {
  completed = 'completed',
  invalid = 'invalid',
  sent = 'sent',
  signed = 'signed',
  sign = 'sign',
  waitingForConfirmation = 'waiting-for-confirmation',
}

export const eventStatuses = Object.values(EventStatus);
export const txStatuses = Object.values(TxStatus);
export const txTypes = Object.values(TxType);
