export type Item = {
  id?: string;
  state?: StateIcon;
  title?: string;
  subtitle?: string;
};
export type stepItem = {
  id?: string;
  state?: StateIcon;
  title?: string;
  subtitle?: string;
  sub?: Item[];
};

export type StateIcon = 'done' | 'pending' | 'idle';
