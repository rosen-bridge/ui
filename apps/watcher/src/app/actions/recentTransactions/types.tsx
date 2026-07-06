export type RecentTransaction = {
  id: string;
  type: 'reward' | 'payment';
  status: 'in-sign' | 'completed' | 'sign-failed';
  lastUpdate: number;
};
