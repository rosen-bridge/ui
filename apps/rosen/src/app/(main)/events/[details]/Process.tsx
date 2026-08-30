'use client';

import { useMemo, useState } from 'react';

import useSWR from 'swr';

import {
  EventProcesses,
  type EventProcessesProps,
  formatDateTime,
  Typography,
} from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';

import type { EventDetailsType, EventStatusType } from '@/backend/events/repository';

import { ProcessSelect } from './ProcessSelect';
import { Section } from './Section';

type Step = {
  key?: EventDetailsType['status'];
  title: string;
  subtitle?: string;
  status: 'done' | 'pending' | 'progress' | 'warning' | 'error' | 'disabled';
  description?: string;
  subs?: Step[];
  line?: boolean;
};

type StepCandidates = Array<Omit<Step, 'subs'> & { subs?: StepCandidates[] }>;

const steps: StepCandidates[] = [
  [
    {
      key: 'CREATED',
      title: 'Creation',
      subtitle: 'Created',
      status: 'done',
    },
  ],
  [
    {
      title: 'Trigger',
      subtitle: 'Pending',
      status: 'pending',
    },
    {
      key: 'TRIGGERED',
      title: 'Trigger',
      subtitle: 'Triggered',
      status: 'done',
      description: 'The event has been reported by a sufficient number of watchers',
    },
  ],
  [
    {
      key: 'REACHED_LIMIT',
      title: 'Error',
      subtitle: 'Reached Limit',
      status: 'error',
      line: true,
    },
    {
      key: 'REJECTED',
      title: 'Error',
      subtitle: 'Rejected',
      status: 'error',
      line: true,
    },
    {
      key: 'TIMEOUT',
      title: 'Error',
      subtitle: 'Timeout',
      status: 'error',
      line: true,
    },
  ],
  [
    {
      title: 'Payment',
      subtitle: 'Pending',
      status: 'pending',
    },
    {
      key: 'PAYMENT_STALLED',
      title: 'Payment',
      subtitle: 'Stalled',
      status: 'warning',
      description:
        'Insufficient assets are available in the lock address for guards to generate the payment transaction',
    },
    {
      title: 'Payment',
      subtitle: 'In Payment',
      status: 'progress',
      subs: [
        [
          {
            key: 'PAYMENT_APPROVED',
            title: 'Approved',
            status: 'done',
          },
        ],
        [
          {
            title: 'Sign',
            status: 'pending',
          },
          {
            key: 'PAYMENT_SIGNING',
            title: 'Signing',
            status: 'progress',
          },
          {
            key: 'PAYMENT_SIGNED',
            title: 'Signed',
            status: 'done',
          },
        ],
        [
          {
            title: 'Send',
            status: 'pending',
          },
          {
            key: 'PAYMENT_SENT',
            title: 'Sent',
            status: 'done',
          },
        ],
      ],
    },
    {
      key: 'PAID',
      title: 'Payment',
      subtitle: 'Paid',
      status: 'done',
      description: 'The transaction reached enough confirmation on blockchain',
      subs: [
        [
          {
            title: 'Approved',
            status: 'done',
          },
        ],
        [
          {
            title: 'Signed',
            status: 'done',
          },
        ],
        [
          {
            title: 'Sent',
            status: 'done',
          },
        ],
      ],
    },
  ],
  [
    {
      title: 'Reward',
      subtitle: 'Pending',
      status: 'pending',
    },
    {
      key: 'REWARD_STALLED',
      title: 'Reward',
      subtitle: 'Stalled',
      status: 'warning',
      description:
        'Insufficient assets are available in the lock address for guards to generate the reward distribution transaction',
    },
    {
      title: 'Reward',
      subtitle: 'In Reward',
      status: 'progress',
      subs: [
        [
          {
            key: 'REWARD_APPROVED',
            title: 'Approved',
            status: 'done',
          },
        ],
        [
          {
            title: 'Sign',
            status: 'pending',
          },
          {
            key: 'REWARD_SIGNING',
            title: 'Signing',
            status: 'progress',
          },
          {
            key: 'REWARD_SIGNED',
            title: 'Signed',
            status: 'done',
          },
        ],
        [
          {
            title: 'Send',
            status: 'pending',
          },
          {
            key: 'REWARD_SENT',
            title: 'Sent',
            status: 'done',
          },
        ],
      ],
    },
    {
      key: 'REWARDED',
      title: 'Reward',
      subtitle: 'Rewarded',
      status: 'done',
      subs: [
        [
          {
            title: 'Approved',
            status: 'done',
          },
        ],
        [
          {
            title: 'Signed',
            status: 'done',
          },
        ],
        [
          {
            title: 'Sent',
            status: 'done',
          },
        ],
      ],
    },
  ],
  [
    {
      title: 'Completion',
      subtitle: 'Pending',
      status: 'pending',
    },
    {
      key: 'COMPLETED',
      title: 'Completion',
      subtitle: 'Completed',
      status: 'done',
    },
    {
      key: 'FRAUD',
      title: 'Completion',
      subtitle: 'Fraud',
      status: 'error',
    },
  ],
];

const findPath = (items?: StepCandidates[], key?: string): number[] | undefined => {
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
    const state = index < path[0] ? 'past' : index === path[0] ? 'current' : 'future';

    const item =
      state === 'past' ? row[row.length - 1] : state === 'current' ? row[path[1]] : row[0];

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
    const subs = step.subs ? toItems(step.subs, timestamps) : undefined;

    const overrideSubtitle =
      step.status === 'progress'
        ? subs?.toReversed().find((sub) => ['progress', 'done'].includes(sub.state))?.title
        : undefined;

    const description = step.description;

    const title = step.title;

    const subtitle = overrideSubtitle || step.subtitle;

    const datetimeRaw = timestamps[step.key as keyof typeof timestamps];

    const datetime = typeof datetimeRaw === 'number' ? new Date(datetimeRaw * 1000) : undefined;

    const state = step.status;

    return {
      state,
      subtitle,
      title,
      datetime,
      description,
      subs,
    };
  });
};

export const Process = ({ id, flowId }: { id: string; flowId: string | undefined }) => {
  const [guardPublicKey, setGuardPublicKey] = useState<string | undefined>();

  const {
    data: events,
    error: eventsError,
    isLoading: eventsIsLoading,
    mutate: eventMutate,
  } = useSWR<EventDetailsType[]>(`/v1/events/${id}`, fetcher);

  const {
    data: status,
    error: statusError,
    isLoading: statusIsLoading,
    mutate: statusMutate,
  } = useSWR<EventStatusType>(
    flowId && guardPublicKey
      ? `/v1/events/${id}/status?triggerTxId=${flowId}&guardPublicKey=${guardPublicKey}`
      : null,
    fetcher,
  );

  const error = eventsError || statusError;
  const isLoading = eventsIsLoading || statusIsLoading || !flowId;
  const mutate = eventsError ? eventMutate : statusMutate;

  const data = guardPublicKey ? status : events?.find((event) => event.txId === flowId);

  const isCustomStatus = typeof data?.status === 'object';

  const items = useMemo<EventProcessesProps['items']>(() => {
    if (!data) return [];

    if (typeof data.status === 'object') return [];

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
        item.subtitle = 'Not Reached';
        item.description = undefined;
        item.status = 'disabled';
        item.subs = undefined;
      });
    }

    if (info[2]?.key === 'PAID') {
      if (data.timestamps.PAID_CONFIRMED_AT_EXPERIMENTAL) {
        info[2].description += ` at "${formatDateTime(data.timestamps.PAID_CONFIRMED_AT_EXPERIMENTAL * 1000)}"`;
      }
    }

    if (data.status === 'FRAUD') {
      info.slice(2, 4).forEach((item) => {
        item.subtitle = 'Not Reached';
        item.description = undefined;
        item.status = 'disabled';
        item.subs = undefined;
      });
    }

    const items = toItems(info, data.timestamps);

    return items;
  }, [data]);

  return (
    <Section
      action={
        !isCustomStatus && (
          <ProcessSelect disabled={isLoading} value={guardPublicKey} onChange={setGuardPublicKey} />
        )
      }
      error={error}
      load={mutate}
      badge="New"
      title="Progress"
    >
      {isCustomStatus ? (
        <Typography>
          No progress chart is available because this event deviated from the standard lifecycle.
          The reason for this exception is noted above.
        </Typography>
      ) : (
        <EventProcesses items={items} loading={isLoading} />
      )}
    </Section>
  );
};
