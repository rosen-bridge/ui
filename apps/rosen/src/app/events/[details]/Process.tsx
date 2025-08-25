import React from 'react';

import {
  DisclosureButton,
  stepItem,
  ProcessTracker,
  useDisclosure,
} from '@rosen-bridge/ui-kit';

import { DetailsCard } from '@/app/events/[details]/DetailsCard';

const Steps: stepItem[] = [
  {
    id: `${crypto.randomUUID()}`,
    state: 'done',
    title: 'Tx Created',
    doneStep: {
      date: '18 Aug 2025 11:14:30',
      description: 'More description about this status goes here.',
    },
    subtitle: 'Tx Created',
    sub: [
      {
        id: `${crypto.randomUUID()}`,
        state: 'done',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: `${crypto.randomUUID()}`,
        state: 'done',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: `${crypto.randomUUID()}`,
        state: 'done',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
    ],
  },
  {
    id: `${crypto.randomUUID()}`,
    state: 'done',
    title: 'Tx Created',
    doneStep: {
      date: '18 Aug 2025 11:14:30',
      description: 'More description about this status goes here.',
    },
    subtitle: 'Tx Created',
    sub: [
      {
        id: `${crypto.randomUUID()}`,
        state: 'done',
        title: 'Tx Apstepproved',
        subtitle: 'Tx Approved',
      },
      {
        id: `${crypto.randomUUID()}`,
        state: 'done',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: `${crypto.randomUUID()}`,
        state: 'done',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
    ],
  },
  {
    id: `${crypto.randomUUID()}`,
    state: 'pending',
    title: 'Tx Created',
    doneStep: {
      date: '18 Aug 2025 11:14:30',
      description: 'More description about this status goes here.',
    },
    subtitle: 'Tx Created',
    sub: [
      {
        id: `${crypto.randomUUID()}`,
        state: 'done',
        title: 'Approved',
        subtitle: '',
      },
      {
        id: `${crypto.randomUUID()}`,
        state: 'pending',
        title: 'Sign',
        subtitle: '',
      },
      {
        id: `${crypto.randomUUID()}`,
        state: 'idle',
        title: 'Send',
        subtitle: '',
      },
    ],
  },
  {
    id: `${crypto.randomUUID()}`,
    state: 'idle',
    title: 'Tx Created',
    doneStep: {
      date: '18 Aug 2025 11:14:30',
      description: 'More description about this status goes here.',
    },
    subtitle: 'Tx Created',
    sub: [
      {
        id: `${crypto.randomUUID()}`,
        state: 'idle',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: `${crypto.randomUUID()}`,
        state: 'idle',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: `${crypto.randomUUID()}`,
        state: 'idle',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
    ],
  },
  {
    id: `${crypto.randomUUID()}`,
    state: 'idle',
    title: 'Tx Created',
    doneStep: {
      date: '18 Aug 2025 11:14:30',
      description: 'More description about this status goes here.',
    },
    subtitle: 'Tx Created',
    sub: [
      {
        id: `${crypto.randomUUID()}`,
        state: 'idle',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: `${crypto.randomUUID()}`,
        state: 'idle',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: `${crypto.randomUUID()}`,
        state: 'idle',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
    ],
  },
  {
    id: `${crypto.randomUUID()}`,
    state: 'idle',
    title: 'Tx Created',
    doneStep: {
      date: '18 Aug 2025 11:14:30',
      description: 'More description about this status goes here.',
    },
    subtitle: 'Tx Created',
    sub: [
      {
        id: `${crypto.randomUUID()}`,
        state: 'idle',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: `${crypto.randomUUID()}`,
        state: 'idle',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: `${crypto.randomUUID()}`,
        state: 'idle',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
    ],
  },
  {
    id: `${crypto.randomUUID()}`,
    state: 'idle',
    title: 'Tx Created',
    doneStep: {
      date: '18 Aug 2025 11:14:30',
      description: 'More description about this status goes here.',
    },
    subtitle: 'Tx Created',
    sub: [
      {
        id: `${crypto.randomUUID()}`,
        state: 'idle',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: `${crypto.randomUUID()}`,
        state: 'idle',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: `${crypto.randomUUID()}`,
        state: 'idle',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
    ],
  },
];

export const Process = () => {
  const disclosure = useDisclosure({
    onOpen: () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.5) {
            resolve();
          } else {
            reject();
          }
        }, 500);
      });
    },
  });
  return (
    <DetailsCard
      action={<DisclosureButton disabled={false} disclosure={disclosure} />}
      state={disclosure.state}
      title="Progress"
    >
      <div style={{ minHeight: '210px' }}>
        <ProcessTracker data={Steps} />
      </div>
    </DetailsCard>
  );
};
