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

const mainSteps: stepItem[] = [
  {
    id: 'Tx Created',
    state: 'done',
    title: 'Tx Created',
    subtitle: 'Tx Created',
    sub: [
      {
        id: 'Tx Approved',
        state: 'done',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: 'Tx Approved',
        state: 'pending',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: 'Tx Approved',
        state: 'idle',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
    ],
  },
  {
    id: 'Tx Created',
    state: 'done',
    title: 'Tx Created',
    subtitle: 'Tx Created',
    sub: [
      {
        id: 'Tx Approved',
        state: 'done',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: 'Tx Approved',
        state: 'pending',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: 'Tx Approved',
        state: 'idle',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
    ],
  },
  {
    id: 'Tx Created',
    state: 'done',
    title: 'Tx Created',
    subtitle: 'Tx Created',
    sub: [
      {
        id: 'Tx Approved',
        state: 'done',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: 'Tx Approved',
        state: 'pending',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: 'Tx Approved',
        state: 'idle',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
    ],
  },
  {
    id: 'Tx Created',
    state: 'done',
    title: 'Tx Created',
    subtitle: 'Tx Created',
    sub: [
      {
        id: 'Tx Approved',
        state: 'done',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: 'Tx Approved',
        state: 'pending',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: 'Tx Approved',
        state: 'idle',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
    ],
  },
];

const mainStepsaa = [
  {
    label: 'Tx Created',
    date: '5/4/2025',
    completed: true,
    subSteps: [
      { label: 'Approved', date: '5/4/2025', completed: true },
      { label: 'Signed', date: '5/4/2025', completed: true },
      { label: 'Sent', date: '5/4/2025', completed: true },
    ],
  },
  {
    label: 'In Payment',
    date: '5/4/2025',
    completed: false,
    subSteps: [
      { label: 'Approved', date: '5/4/2025', completed: true },
      { label: 'Signed', date: '5/4/2025', completed: true },
      { label: 'Sent', date: '5/4/2025', completed: true },
    ],
  },
  {
    label: 'Reward',
    date: '5/4/2025',
    completed: false,
    subSteps: [
      { label: 'Approved', date: '5/4/2025', completed: true },
      { label: 'Signed', date: '5/4/2025', completed: true },
      { label: 'Sent', date: '5/4/2025', completed: true },
    ],
  },
  {
    label: 'In Payment',
    date: '5/4/2025',
    completed: false,
    subSteps: [
      { label: 'Approved', date: '5/4/2025', completed: true },
      { label: 'Signed', date: '5/4/2025', completed: true },
      { label: 'Sent', date: '5/4/2025', completed: true },
    ],
  },
  {
    label: 'Reward',
    date: '5/4/2025',
    completed: false,
    subSteps: [
      { label: 'Approved', date: '5/4/2025', completed: true },
      { label: 'Signed', date: '5/4/2025', completed: true },
      { label: 'Sent', date: '5/4/2025', completed: true },
    ],
  },
  {
    label: 'In Payment',
    date: '5/4/2025',
    completed: false,
    subSteps: [
      { label: 'Approved', date: '5/4/2025', completed: true },
      { label: 'Signed', date: '5/4/2025', completed: true },
      { label: 'Sent', date: '5/4/2025', completed: true },
    ],
  },
  {
    label: 'Reward',
    date: '5/4/2025',
    completed: false,
    subSteps: [
      { label: 'Approved', date: '5/4/2025', completed: true },
      { label: 'Signed', date: '5/4/2025', completed: true },
      { label: 'Sent', date: '5/4/2025', completed: true },
    ],
  },
];
