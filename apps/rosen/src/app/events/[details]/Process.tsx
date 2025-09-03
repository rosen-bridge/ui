import React, { useState } from 'react';

import {
  DisclosureButton,
  stepItem,
  ProcessTracker,
  useDisclosure,
  Skeleton,
} from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import useSWR from 'swr';

import { DetailsCard } from '@/app/events/[details]/DetailsCard';
import { EventDetails } from '@/app/events/[details]/type';

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

export const Process = ({ id }: { id: string }) => {
  const { data, mutate, isLoading } = useSWR<EventDetails>(
    `/v1/events/${id}`,
    fetcher,
  );

  const disclosure = useDisclosure({
    onOpen: async () => {
      await mutate();
    },
  });
  return (
    <DetailsCard
      action={<DisclosureButton disabled={false} disclosure={disclosure} />}
      state={disclosure.state}
      title="Progress"
    >
      <div style={{ minHeight: '210px', height: '210px', maxHeight: '210px' }}>
        {!isLoading ? (
          <ProcessTracker data={Steps} />
        ) : (
          <Skeleton
            variant="rounded"
            width="100%"
            height="100%"
            sx={{ display: 'block' }}
          />
        )}
      </div>
    </DetailsCard>
  );
};
