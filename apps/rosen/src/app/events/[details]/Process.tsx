import React from 'react';

import {
  DisclosureButton,
  ProcessTracker,
  useDisclosure,
} from '@rosen-bridge/ui-kit';
import { ProcessTrackerItem } from '@rosen-bridge/ui-kit';

import { Section } from './Section';
import { DetailsProps } from './type';

const Steps: ProcessTrackerItem[] = [
  {
    id: `${crypto.randomUUID()}`,
    state: 'done',
    title: 'Created',
    subtitle: '18 Aug 2025 11:14:30',
    description: 'More description about this status goes here.',
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
    title: 'Committed',
    subtitle: '18 Aug 2025 11:14:30',
    description: 'More description about this status goes here.',
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
    title: 'Triggered',
    subtitle: '18 Aug 2025 11:14:30',
    description: 'More description about this status goes here.',

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
    subtitle: '18 Aug 2025 11:14:30',
    description: 'More description about this status goes here.',
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
    title: 'In Payment',
    subtitle: '18 Aug 2025 11:14:30',
    description: 'More description about this status goes here.',

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
    title: 'Reward',
    subtitle: '18 Aug 2025 11:14:30',
    description: 'More description about this status goes here.',
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
    title: 'Completion',
    subtitle: '18 Aug 2025 11:14:30',
    description: 'More description about this status goes here.',

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

export const Process = ({ details, loading: isLoading }: DetailsProps) => {
  const disclosure = useDisclosure();
  return (
    <Section
      action={<DisclosureButton disabled={false} disclosure={disclosure} />}
      state={disclosure.state}
      title="Progress"
    >
      <div
        style={{ minHeight: '210px', height: isLoading ? '210px' : 'unset' }}
      >
        <ProcessTracker
          overrides={{
            mobile: {
              orientation: 'vertical',
            },
            laptop: {
              orientation: 'horizontal',
            },
          }}
          loading={isLoading}
          steps={Steps}
        />
      </div>
    </Section>
  );
};
