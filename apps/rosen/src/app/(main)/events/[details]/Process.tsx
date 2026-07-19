'use client';

import { useEffect, useMemo, useState } from 'react';

import useSWR from 'swr';

import {
  type Color,
  EventProcesses,
  type EventProcessesProps,
  type IconProps,
} from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';

import type {
  EventDetailsType,
  EventStatusType,
} from '@/backend/events/repository';

import { ProcessSelect } from './ProcessSelect';
import { Section } from './Section';

type Step = {
  key?: EventDetailsType['status'];
  label: string;
  status: 'DONE' | 'PENDING' | 'PROGRESS' | 'WARNING' | 'ERROR' | 'DISABLED';
  description?: string;
  subs?: Omit<Step, 'subs'>[];
  line?: boolean;
};

type StepCandidates = Array<
  Omit<Step, 'subs'> & { subs?: Omit<Step, 'subs'>[][] }
>;

const steps: StepCandidates[] = [
  [
    {
      key: 'CREATED',
      label: 'Created',
      status: 'DONE',
    },
  ],
  [
    {
      label: 'Trigger',
      status: 'PENDING',
    },
    {
      key: 'TRIGGERED',
      label: 'Triggered',
      status: 'DONE',
      description:
        'The event has been reported by a sufficient number of watchers',
    },
  ],
  [
    {
      key: 'REACHED_LIMIT',
      label: 'Reached Limit',
      status: 'ERROR',
      line: true,
    },
    {
      key: 'REJECTED',
      label: 'Rejected',
      status: 'ERROR',
      line: true,
    },
    {
      key: 'TIMEOUT',
      label: 'Timeout',
      status: 'ERROR',
      line: true,
    },
  ],
  [
    {
      label: 'Payment',
      status: 'PENDING',
    },
    {
      key: 'PAYMENT_STALLED',
      label: 'Payment Stalled',
      status: 'WARNING',
      description:
        'Insufficient assets are available in the lock address for guards to generate the payment transaction',
    },
    {
      label: 'In Payment',
      status: 'PROGRESS',
      subs: [
        [
          {
            key: 'PAYMENT_APPROVED',
            label: 'Approved',
            status: 'DONE',
          },
        ],
        [
          {
            label: 'Sign',
            status: 'PENDING',
          },
          {
            key: 'PAYMENT_SIGNING',
            label: 'Signing',
            status: 'PROGRESS',
          },
          {
            key: 'PAYMENT_SIGNED',
            label: 'Signed',
            status: 'DONE',
          },
        ],
        [
          {
            label: 'Send',
            status: 'PENDING',
          },
          {
            key: 'PAYMENT_SENT',
            label: 'Sent',
            status: 'DONE',
          },
        ],
      ],
    },
    {
      key: 'PAID',
      label: 'Paid',
      status: 'DONE',
      description: 'The transaction reached enough confirmation on blockchain',
      subs: [
        [
          {
            label: 'Approved',
            status: 'DONE',
          },
        ],
        [
          {
            label: 'Signed',
            status: 'DONE',
          },
        ],
        [
          {
            label: 'Sent',
            status: 'DONE',
          },
        ],
      ],
    },
  ],
  [
    {
      label: 'Reward',
      status: 'PENDING',
    },
    {
      key: 'REWARD_STALLED',
      label: 'Reward Stalled',
      status: 'WARNING',
      description:
        'Insufficient assets are available in the lock address for guards to generate the reward distribution transaction',
    },
    {
      label: 'In Reward',
      status: 'PROGRESS',
      subs: [
        [
          {
            key: 'REWARD_APPROVED',
            label: 'Approved',
            status: 'DONE',
          },
        ],
        [
          {
            label: 'Sign',
            status: 'PENDING',
          },
          {
            key: 'REWARD_SIGNING',
            label: 'Signing',
            status: 'PROGRESS',
          },
          {
            key: 'REWARD_SIGNED',
            label: 'Signed',
            status: 'DONE',
          },
        ],
        [
          {
            label: 'Send',
            status: 'PENDING',
          },
          {
            key: 'REWARD_SENT',
            label: 'Sent',
            status: 'DONE',
          },
        ],
      ],
    },
    {
      key: 'REWARDED',
      label: 'Rewarded',
      status: 'DONE',
      subs: [
        [
          {
            label: 'Approved',
            status: 'DONE',
          },
        ],
        [
          {
            label: 'Signed',
            status: 'DONE',
          },
        ],
        [
          {
            label: 'Sent',
            status: 'DONE',
          },
        ],
      ],
    },
  ],
  [
    {
      label: 'Completion',
      status: 'PENDING',
    },
    {
      key: 'COMPLETED',
      label: 'Completed',
      status: 'DONE',
    },
    {
      key: 'FRAUD',
      label: 'Fraud',
      status: 'ERROR',
    },
  ],
];

const findPath = (
  items?: StepCandidates[],
  key?: string,
): number[] | undefined => {
  if (!items || !key) return;

  for (let i = 0; i < items.length; i++) {
    for (let j = 0; j < items[i].length; j++) {
      const item = items[i][j];

      if (item.key === key) return [i, j];

      if (!item.subs) continue;

      const path = findPath(item.subs, key);

      if (!path) continue;

      return [i, j, ...path];
    }
  }
};

const pick = (items: StepCandidates[], path: number[] = [-1]): Step[] => {
  return items.map((row, index) => {
    const state =
      index < path[0] ? 'past' : index === path[0] ? 'current' : 'future';

    const item =
      state === 'past'
        ? row[row.length - 1]
        : state === 'current'
          ? row[path[1]]
          : row[0];

    const { subs, ...rest } = item;

    if (!subs) return rest;

    const subPath =
      state === 'past'
        ? [Infinity]
        : state === 'future'
          ? [-1]
          : path.length > 2
            ? path.slice(2)
            : [Infinity];

    return { ...rest, subs: pick(subs, subPath) };
  });
};

const toItems = (
  steps: Step[],
  timestamps: EventStatusType['timestamps'],
): EventProcessesProps['items'] => {
  return steps.map((step) => {
    const description = step.description;

    const label = step.label;

    const line = step.line;

    const sub = step.subs ? toItems(step.subs, timestamps) : undefined;

    const timestampRaw = timestamps[step.key as keyof typeof timestamps];

    const timestamp =
      typeof timestampRaw === 'number' ? timestampRaw * 1000 : undefined;

    const value = crypto.randomUUID();

    const color: Color = (() => {
      switch (step.status) {
        case 'DISABLED':
          return 'neutral-light';
        case 'DONE':
          return 'success';
        case 'ERROR':
          return 'error';
        case 'PENDING':
          return 'neutral';
        case 'PROGRESS':
          return 'info';
        case 'WARNING':
          return 'warning';
        default:
          return 'neutral';
      }
    })();

    const icon: IconProps['name'] = (() => {
      switch (step.status) {
        case 'DISABLED':
          return 'CircleFill';
        case 'DONE':
          return 'Check';
        case 'ERROR':
          return step.line ? 'ExclamationTriangleFill' : 'Times';
        case 'PENDING':
          return 'CircleFill';
        case 'PROGRESS':
          return 'Hourglass';
        case 'WARNING':
          return 'ExclamationCircle';
      }
    })();

    return { color, description, icon, label, line, sub, timestamp, value };
  });
};

export const Process = ({ id, flowId }: { id: string; flowId: string }) => {
  const [active, setActive] = useState<string | undefined>();

  const [guardPublicKey, setGuardPublicKey] = useState<string>('');

  const [open, setOpen] = useState(false);

  const url = guardPublicKey
    ? `/v1/events/${id}/status?triggerTxId=${flowId}&guardPublicKey=${guardPublicKey}`
    : `/v1/events/${id}/status?triggerTxId=${flowId}`;

  const { data, error, isLoading, mutate } = useSWR<EventStatusType>(
    open && flowId ? url : null,
    fetcher,
  );

  const items = useMemo(() => {
    if (!data) return [];

    const info = structuredClone(pick(steps, findPath(steps, data.status)));

    const isException = info
      .filter((item) => item.line)
      .map((item) => item.key)
      .includes(data.status);

    if (!isException) {
      info.splice(2, 1);
    }

    if (isException) {
      info.slice(3).forEach((item) => {
        item.description = undefined;
        item.status = 'DISABLED';
        item.subs = undefined;
      });
    }

    if (info[2]?.key === 'PAID') {
      if (data.timestamps.PAID_CONFIRMED_AT_EXPERIMENTAL) {
        info[2].description += ` at "${new Date(data.timestamps.PAID_CONFIRMED_AT_EXPERIMENTAL * 1000).toString()}"`;
      }
    }

    if (data.status === 'FRAUD') {
      info.slice(2, 4).forEach((item) => {
        item.description = undefined;
        item.status = 'DISABLED';
        item.subs = undefined;
      });
    }

    const items = toItems(info, data.timestamps);

    return items;
  }, [data]);

  useEffect(() => {
    const value = items?.find((item) => item.label?.startsWith('In '))?.value;

    if (!value) return;

    setActive(value);
  }, [items]);

  return (
    <Section
      action={
        <ProcessSelect
          disabled={isLoading}
          value={guardPublicKey}
          onChange={setGuardPublicKey}
        />
      }
      collapsible
      error={error}
      load={mutate}
      title="Progress"
      onOpenChange={setOpen}
    >
      <EventProcesses
        items={items}
        loading={isLoading}
        style={{ width: '100%', height: isLoading ? '104px' : undefined }}
        value={active}
        onChange={setActive}
      />
    </Section>
  );
};
