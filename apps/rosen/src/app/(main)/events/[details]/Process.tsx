'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  Color,
  EventProcesses,
  EventProcessesProps,
  IconProps,
} from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import useSWR from 'swr';

import { EventDetailsType, EventStatusType } from '@/backend/events/repository';

import { ProcessSelect } from './ProcessSelect';
import { Section } from './Section';

type Step = {
  label:
    | 'Rewarded'
    | 'Completed'
    | 'Created'
    | 'Trigger'
    | 'Payment'
    | 'Reward'
    | 'Completion'
    | 'Triggered'
    | 'Fraud'
    | 'Paid'
    | 'Approved'
    | 'Signed'
    | 'Sent'
    | 'In Payment'
    | 'Sign'
    | 'Send'
    | 'In Sign'
    | 'Payment Stalled'
    | 'Reached Limit'
    | 'Rejected'
    | 'Reward Stalled'
    | 'Timeout'
    | 'In Reward';
  status: 'DISABLED' | 'DONE' | 'ERROR' | 'PENDING' | 'PROGRESS' | 'WARNING';
  sub?: Omit<Step, 'line' | 'sub'>[];
  detailsKey?: EventDetailsType['status'];
  line?: boolean;
};

const INFO: Partial<Record<EventDetailsType['status'], string>> = {
  PAID: 'The transaction reached enough confirmation on blockchain',
  PAYMENT_STALLED:
    'Insufficient assets are available in the lock address for guards to generate the payment transaction',
  REWARD_STALLED:
    'Insufficient assets are available in the lock address for guards to generate the reward distribution transaction',
  TRIGGERED: 'The event has been reported by a sufficient number of watchers',
};

const FLOWS: Record<EventDetailsType['status'], Step[]> = {
  COMPLETED: [
    {
      label: 'Created',
      status: 'DONE',
      detailsKey: 'CREATED',
    },
    {
      label: 'Triggered',
      status: 'DONE',
      detailsKey: 'TRIGGERED',
    },
    {
      label: 'Paid',
      status: 'DONE',
      detailsKey: 'PAID',
      sub: [
        {
          label: 'Approved',
          status: 'DONE',
          detailsKey: 'PAYMENT_APPROVED',
        },
        {
          label: 'Signed',
          status: 'DONE',
          detailsKey: 'PAYMENT_SIGNED',
        },
        {
          label: 'Sent',
          status: 'DONE',
          detailsKey: 'PAYMENT_SENT',
        },
      ],
    },
    {
      label: 'Rewarded',
      status: 'DONE',
      detailsKey: 'REWARDED',
      sub: [
        {
          label: 'Approved',
          status: 'DONE',
          detailsKey: 'REWARD_APPROVED',
        },
        {
          label: 'Signed',
          status: 'DONE',
          detailsKey: 'REWARD_SIGNED',
        },
        {
          label: 'Sent',
          status: 'DONE',
          detailsKey: 'REWARD_SENT',
        },
      ],
    },
    {
      label: 'Completed',
      status: 'DONE',
      detailsKey: 'COMPLETED',
    },
  ],
  CREATED: [
    {
      label: 'Created',
      status: 'DONE',
      detailsKey: 'CREATED',
    },
    {
      label: 'Trigger',
      status: 'PENDING',
    },
    {
      label: 'Payment',
      status: 'PENDING',
    },
    {
      label: 'Reward',
      status: 'PENDING',
    },
    {
      label: 'Completion',
      status: 'PENDING',
    },
  ],
  FRAUD: [
    {
      label: 'Created',
      status: 'DONE',
      detailsKey: 'CREATED',
    },
    {
      label: 'Triggered',
      status: 'DONE',
      detailsKey: 'TRIGGERED',
    },
    {
      label: 'Payment',
      status: 'DISABLED',
    },
    {
      label: 'Reward',
      status: 'DISABLED',
    },
    {
      label: 'Fraud',
      status: 'ERROR',
      detailsKey: 'FRAUD',
    },
  ],
  MULTIPLE_FLOWS: [],
  PAID: [
    {
      label: 'Created',
      status: 'DONE',
      detailsKey: 'CREATED',
    },
    {
      label: 'Triggered',
      status: 'DONE',
      detailsKey: 'TRIGGERED',
    },
    {
      label: 'Paid',
      status: 'DONE',
      detailsKey: 'PAID',
      sub: [
        {
          label: 'Approved',
          status: 'DONE',
          detailsKey: 'PAYMENT_APPROVED',
        },
        {
          label: 'Signed',
          status: 'DONE',
          detailsKey: 'PAYMENT_SIGNED',
        },
        {
          label: 'Sent',
          status: 'DONE',
          detailsKey: 'PAYMENT_SENT',
        },
      ],
    },
    {
      label: 'Reward',
      status: 'PENDING',
    },
    {
      label: 'Completion',
      status: 'PENDING',
    },
  ],
  PAYMENT_APPROVED: [
    {
      label: 'Created',
      status: 'DONE',
      detailsKey: 'CREATED',
    },
    {
      label: 'Triggered',
      status: 'DONE',
      detailsKey: 'TRIGGERED',
    },
    {
      label: 'In Payment',
      status: 'PROGRESS',
      sub: [
        {
          label: 'Approved',
          status: 'DONE',
          detailsKey: 'PAYMENT_APPROVED',
        },
        {
          label: 'Sign',
          status: 'PENDING',
        },
        {
          label: 'Send',
          status: 'PENDING',
        },
      ],
    },
    {
      label: 'Reward',
      status: 'PENDING',
    },
    {
      label: 'Completion',
      status: 'PENDING',
    },
  ],
  PAYMENT_SENT: [
    {
      label: 'Created',
      status: 'DONE',
      detailsKey: 'CREATED',
    },
    {
      label: 'Triggered',
      status: 'DONE',
      detailsKey: 'TRIGGERED',
    },
    {
      label: 'In Payment',
      status: 'PROGRESS',
      sub: [
        {
          label: 'Approved',
          status: 'DONE',
          detailsKey: 'PAYMENT_APPROVED',
        },
        {
          label: 'Signed',
          status: 'DONE',
          detailsKey: 'PAYMENT_SIGNED',
        },
        {
          label: 'Sent',
          status: 'DONE',
          detailsKey: 'PAYMENT_SENT',
        },
      ],
    },
    {
      label: 'Reward',
      status: 'PENDING',
    },
    {
      label: 'Completion',
      status: 'PENDING',
    },
  ],
  PAYMENT_SIGNED: [
    {
      label: 'Created',
      status: 'DONE',
      detailsKey: 'CREATED',
    },
    {
      label: 'Triggered',
      status: 'DONE',
      detailsKey: 'TRIGGERED',
    },
    {
      label: 'In Payment',
      status: 'PROGRESS',
      sub: [
        {
          label: 'Approved',
          status: 'DONE',
          detailsKey: 'PAYMENT_APPROVED',
        },
        {
          label: 'Signed',
          status: 'DONE',
          detailsKey: 'PAYMENT_SIGNED',
        },
        {
          label: 'Send',
          status: 'PENDING',
        },
      ],
    },
    {
      label: 'Reward',
      status: 'PENDING',
    },
    {
      label: 'Completion',
      status: 'PENDING',
    },
  ],
  PAYMENT_SIGNING: [
    {
      label: 'Created',
      status: 'DONE',
      detailsKey: 'CREATED',
    },
    {
      label: 'Triggered',
      status: 'DONE',
      detailsKey: 'TRIGGERED',
    },
    {
      label: 'In Payment',
      status: 'PROGRESS',
      sub: [
        {
          label: 'Approved',
          status: 'DONE',
          detailsKey: 'PAYMENT_APPROVED',
        },
        {
          label: 'In Sign',
          status: 'PROGRESS',
          detailsKey: 'PAYMENT_SIGNING',
        },
        {
          label: 'Send',
          status: 'PENDING',
        },
      ],
    },
    {
      label: 'Reward',
      status: 'PENDING',
    },
    {
      label: 'Completion',
      status: 'PENDING',
    },
  ],
  PAYMENT_STALLED: [
    {
      label: 'Created',
      status: 'DONE',
      detailsKey: 'CREATED',
    },
    {
      label: 'Triggered',
      status: 'DONE',
      detailsKey: 'TRIGGERED',
    },
    {
      label: 'Payment Stalled',
      status: 'WARNING',
      detailsKey: 'PAYMENT_STALLED',
    },
    {
      label: 'Reward',
      status: 'PENDING',
    },
    {
      label: 'Completion',
      status: 'PENDING',
    },
  ],
  REACHED_LIMIT: [
    {
      label: 'Created',
      status: 'DONE',
      detailsKey: 'CREATED',
    },
    {
      label: 'Triggered',
      status: 'DONE',
      detailsKey: 'TRIGGERED',
    },
    {
      label: 'Reached Limit',
      status: 'ERROR',
      detailsKey: 'REACHED_LIMIT',
      line: true,
    },
    {
      label: 'Payment',
      status: 'DISABLED',
    },
    {
      label: 'Reward',
      status: 'DISABLED',
    },
    {
      label: 'Completion',
      status: 'DISABLED',
    },
  ],
  REJECTED: [
    {
      label: 'Created',
      status: 'DONE',
      detailsKey: 'CREATED',
    },
    {
      label: 'Triggered',
      status: 'DONE',
      detailsKey: 'TRIGGERED',
    },
    {
      label: 'Rejected',
      status: 'ERROR',
      detailsKey: 'REJECTED',
      line: true,
    },
    {
      label: 'Payment',
      status: 'DISABLED',
    },
    {
      label: 'Reward',
      status: 'DISABLED',
    },
    {
      label: 'Completion',
      status: 'DISABLED',
    },
  ],
  REWARDED: [],
  REWARD_APPROVED: [
    {
      label: 'Created',
      status: 'DONE',
      detailsKey: 'CREATED',
    },
    {
      label: 'Triggered',
      status: 'DONE',
      detailsKey: 'TRIGGERED',
    },
    {
      label: 'Paid',
      status: 'DONE',
      detailsKey: 'PAID',
      sub: [
        {
          label: 'Approved',
          status: 'DONE',
          detailsKey: 'PAYMENT_APPROVED',
        },
        {
          label: 'Signed',
          status: 'DONE',
          detailsKey: 'PAYMENT_SIGNED',
        },
        {
          label: 'Sent',
          status: 'DONE',
          detailsKey: 'PAYMENT_SENT',
        },
      ],
    },
    {
      label: 'In Reward',
      status: 'PROGRESS',
      sub: [
        {
          label: 'Approved',
          status: 'DONE',
          detailsKey: 'REWARD_APPROVED',
        },
        {
          label: 'Sign',
          status: 'PENDING',
        },
        {
          label: 'Send',
          status: 'PENDING',
        },
      ],
    },
    {
      label: 'Completion',
      status: 'PENDING',
    },
  ],
  REWARD_SENT: [
    {
      label: 'Created',
      status: 'DONE',
      detailsKey: 'CREATED',
    },
    {
      label: 'Triggered',
      status: 'DONE',
      detailsKey: 'TRIGGERED',
    },
    {
      label: 'Paid',
      status: 'DONE',
      detailsKey: 'PAID',
      sub: [
        {
          label: 'Approved',
          status: 'DONE',
          detailsKey: 'PAYMENT_APPROVED',
        },
        {
          label: 'Signed',
          status: 'DONE',
          detailsKey: 'PAYMENT_SIGNED',
        },
        {
          label: 'Sent',
          status: 'DONE',
          detailsKey: 'PAYMENT_SENT',
        },
      ],
    },
    {
      label: 'In Reward',
      status: 'PROGRESS',
      sub: [
        {
          label: 'Approved',
          status: 'DONE',
          detailsKey: 'REWARD_APPROVED',
        },
        {
          label: 'Signed',
          status: 'DONE',
          detailsKey: 'REWARD_SIGNED',
        },
        {
          label: 'Sent',
          status: 'DONE',
          detailsKey: 'REWARD_SENT',
        },
      ],
    },
    {
      label: 'Completion',
      status: 'PENDING',
    },
  ],
  REWARD_SIGNED: [
    {
      label: 'Created',
      status: 'DONE',
      detailsKey: 'CREATED',
    },
    {
      label: 'Triggered',
      status: 'DONE',
      detailsKey: 'TRIGGERED',
    },
    {
      label: 'Paid',
      status: 'DONE',
      detailsKey: 'PAID',
      sub: [
        {
          label: 'Approved',
          status: 'DONE',
          detailsKey: 'PAYMENT_APPROVED',
        },
        {
          label: 'Signed',
          status: 'DONE',
          detailsKey: 'PAYMENT_SIGNED',
        },
        {
          label: 'Sent',
          status: 'DONE',
          detailsKey: 'PAYMENT_SENT',
        },
      ],
    },
    {
      label: 'In Reward',
      status: 'PROGRESS',
      sub: [
        {
          label: 'Approved',
          status: 'DONE',
          detailsKey: 'REWARD_APPROVED',
        },
        {
          label: 'Signed',
          status: 'DONE',
          detailsKey: 'REWARD_SIGNED',
        },
        {
          label: 'Send',
          status: 'PENDING',
        },
      ],
    },
    {
      label: 'Completion',
      status: 'PENDING',
    },
  ],
  REWARD_SIGNING: [
    {
      label: 'Created',
      status: 'DONE',
      detailsKey: 'CREATED',
    },
    {
      label: 'Triggered',
      status: 'DONE',
      detailsKey: 'TRIGGERED',
    },
    {
      label: 'Paid',
      status: 'DONE',
      detailsKey: 'PAID',
      sub: [
        {
          label: 'Approved',
          status: 'DONE',
          detailsKey: 'PAYMENT_APPROVED',
        },
        {
          label: 'Signed',
          status: 'DONE',
          detailsKey: 'PAYMENT_SIGNED',
        },
        {
          label: 'Sent',
          status: 'DONE',
          detailsKey: 'PAYMENT_SENT',
        },
      ],
    },
    {
      label: 'In Reward',
      status: 'PROGRESS',
      sub: [
        {
          label: 'Approved',
          status: 'DONE',
          detailsKey: 'REWARD_APPROVED',
        },
        {
          label: 'In Sign',
          status: 'PROGRESS',
          detailsKey: 'REWARD_SIGNING',
        },
        {
          label: 'Send',
          status: 'PENDING',
        },
      ],
    },
    {
      label: 'Completion',
      status: 'PENDING',
    },
  ],
  REWARD_STALLED: [
    {
      label: 'Created',
      status: 'DONE',
      detailsKey: 'CREATED',
    },
    {
      label: 'Triggered',
      status: 'DONE',
      detailsKey: 'TRIGGERED',
    },
    {
      label: 'Paid',
      status: 'DONE',
      detailsKey: 'PAID',
      sub: [
        {
          label: 'Approved',
          status: 'DONE',
          detailsKey: 'PAYMENT_APPROVED',
        },
        {
          label: 'Signed',
          status: 'DONE',
          detailsKey: 'PAYMENT_SIGNED',
        },
        {
          label: 'Sent',
          status: 'DONE',
          detailsKey: 'PAYMENT_SENT',
        },
      ],
    },
    {
      label: 'Reward Stalled',
      status: 'WARNING',
      detailsKey: 'REWARD_STALLED',
    },
    {
      label: 'Completion',
      status: 'PENDING',
    },
  ],
  TIMEOUT: [
    {
      label: 'Created',
      status: 'DONE',
      detailsKey: 'CREATED',
    },
    {
      label: 'Triggered',
      status: 'DONE',
      detailsKey: 'TRIGGERED',
    },
    {
      label: 'Timeout',
      status: 'ERROR',
      detailsKey: 'TIMEOUT',
      line: true,
    },
    {
      label: 'Payment',
      status: 'DISABLED',
    },
    {
      label: 'Reward',
      status: 'DISABLED',
    },
    {
      label: 'Completion',
      status: 'DISABLED',
    },
  ],
  TRIGGERED: [
    {
      label: 'Created',
      status: 'DONE',
      detailsKey: 'CREATED',
    },
    {
      label: 'Triggered',
      status: 'DONE',
      detailsKey: 'TRIGGERED',
    },
    {
      label: 'Payment',
      status: 'PENDING',
    },
    {
      label: 'Reward',
      status: 'PENDING',
    },
    {
      label: 'Completion',
      status: 'PENDING',
    },
  ],
  UNKNOWN: [],
};

const toItems = (
  steps: Step[],
  timestamps: EventDetailsType['timestamps'],
): EventProcessesProps['items'] => {
  return steps.map((step) => {
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
      }
    })();

    const description = step.detailsKey ? INFO[step.detailsKey] : undefined;

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

    const label = step.label;

    const line = step.line;

    const sub = step.sub ? toItems(step.sub, timestamps) : undefined;

    const timestampRaw = step.detailsKey
      ? timestamps[step.detailsKey]
      : undefined;

    const timestamp =
      typeof timestampRaw === 'number' ? timestampRaw * 1000 : undefined;

    const value = crypto.randomUUID();

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

    const items = toItems(FLOWS[data.status], data.timestamps) || [];

    if (data.timestamps['PAID_CONFIRMED_AT_EXPERIMENTAL']) {
      for (const item of items) {
        if (item.label === 'Paid') {
          item.description += ` at "${new Date(data.timestamps['PAID_CONFIRMED_AT_EXPERIMENTAL'] * 1000).toString()}"`;
        }
      }
    }

    return items;
  }, [data]);

  useEffect(() => {
    if (!data || !items) return;

    const index = FLOWS[data.status].findIndex(
      (item) => item.status === 'PROGRESS',
    );

    const value = items[index]?.value;

    if (!value) return;

    setActive(value);
  }, [data?.status, items]);

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
