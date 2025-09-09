export type ProcessTrackerStateIcon = 'done' | 'pending' | 'idle';

type BaseProcessTrackerItem = {
  id?: string;
  state?: ProcessTrackerStateIcon;
  title?: string;
  subtitle?: string;
};

export type ProcessTrackerSubItem = BaseProcessTrackerItem;

export type ProcessTrackerItem = BaseProcessTrackerItem & {
  subtitle: string;
  description: string;
  sub?: ProcessTrackerSubItem[];
};
