'use client';

import { useMemo, useState } from 'react';

import { Color, Icon, IconProps } from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import useSWR from 'swr';

import { EventDetailsType, EventStatusType } from '@/backend/events/repository';

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
  status: 'DONE' | 'ERROR' | 'PENDING' | 'PROGRESS';
  sub?: Omit<Step, 'sub'>[];
  detailsKey?: EventDetailsType['status'];
};

type TimelineItem = {
  color: Color;
  description?: string;
  icon: IconProps['name'];
  label: string;
  sub?: TimelineItem[];
  timestamp?: number;
};

const GUARDS = JSON.parse(process.env['ALLOWED_PKS'] ?? '{}');

const INFO: Partial<Record<EventDetailsType['status'], string>> = {
  PAID: 'The transaction reached enough confirmation on blockchain at "confirmedAt"',
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
      status: 'PROGRESS',
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
    },
  ],
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
      status: 'PROGRESS',
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
): TimelineItem[] => {
  return steps.map((step) => {
    const color: Color = (() => {
      switch (step.status) {
        case 'DONE':
          return 'success';
        case 'ERROR':
          return 'error';
        case 'PENDING':
          return 'neutral';
        case 'PROGRESS':
          return 'info';
      }
    })();

    const description = step.detailsKey ? INFO[step.detailsKey] : undefined;

    const icon: IconProps['name'] = (() => {
      switch (step.status) {
        case 'DONE':
          return 'Check';
        case 'ERROR':
          return 'Times';
        case 'PENDING':
          return 'ExclamationCircle';
        case 'PROGRESS':
          return 'Hourglass';
      }
    })();

    const label = step.label;

    const sub = step.sub ? toItems(step.sub, timestamps) : undefined;

    const timestamp = step.detailsKey ? timestamps[step.detailsKey] : undefined;

    return { color, description, icon, label, sub, timestamp };
  });
};

export const Process = ({ id }: { id: string }) => {
  const [guardPublicKey, setGuardPublicKey] = useState<string>();

  const { data } = useSWR<EventStatusType>(
    guardPublicKey
      ? `/v1/events/${id}/status`
      : `/v1/events/${id}/status?guardPublicKey=${guardPublicKey}`,
    fetcher,
  );

  const items = useMemo(() => {
    if (!data) return [];
    return toItems(FLOWS[data.status], data.timestamps);
  }, [data]);

  return (
    <Section title="Progress">
      <select onChange={(event) => setGuardPublicKey(event.target.value)}>
        <option value="" defaultChecked>
          Overall
        </option>
        {Object.keys(GUARDS).map((key) => (
          <option key={key} value={key}>
            {GUARDS[key]}
          </option>
        ))}
      </select>
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            <Icon color={item.color} name={item.icon} />
            {item.label}{' '}
            {item.timestamp && (
              <small style={{ opacity: 0.5 }}>({item.timestamp})</small>
            )}
            {item.sub && (
              <ul>
                {item.sub.map((item, index) => (
                  <li key={index}>
                    <Icon color={item.color} name={item.icon} />
                    {item.label}{' '}
                    {item.timestamp && (
                      <small style={{ opacity: 0.5 }}>({item.timestamp})</small>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </Section>
  );
};
