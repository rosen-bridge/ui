'use client';

import { Section } from './Section';
import useSWR from 'swr';
import { fetcher } from '@rosen-ui/swr-helpers';
import { useMemo } from 'react';
import { EventDetailsType } from '@/backend/events/repository';
import { Color, IconProps } from '@rosen-bridge/ui-kit';

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
    |'In Reward';
  status: 'DONE' | 'ERROR' | 'PENDING' | 'PROGRESS';
  sub?: Omit<Step, 'sub'>[]; 
  infooookey?: EventDetailsType['status'];
};

const INFO: Partial<Record<EventDetailsType['status'], string> > = {
  PAID: 'The transaction reached enough confirmation on blockchain at "confirmedAt"',
  PAYMENT_STALLED: 'Insufficient assets are available in the lock address for guards to generate the payment transaction',
  REWARD_STALLED: 'Insufficient assets are available in the lock address for guards to generate the reward distribution transaction',
  TRIGGERED: 'The event has been reported by a sufficient number of watchers',
}

const FLOWS: Record<EventDetailsType['status'], Step[]> = {
  COMPLETED: [
    {
      label: 'Created',
      status: 'DONE',
      infooookey: 'CREATED'
    },
    {
      label: 'Triggered',
      status: 'DONE',
      infooookey: 'TRIGGERED'
    },
    {
      label: 'Paid',
      status: 'DONE',
      sub: [
        {
          label: 'Approved',
          status: 'DONE',
          infooookey: 'PAYMENT_APPROVED'
        },
        {
          label: 'Signed',
          status: 'DONE',
          infooookey: 'PAYMENT_SIGNED'
        },
        {
          label: 'Sent',
          status: 'DONE',
          infooookey: 'PAYMENT_SENT'
        },
      ]
    },
    {
      label: 'Rewarded',
      status: 'DONE',
      sub: [
        {
          label: 'Approved',
          status: 'DONE',
          infooookey: 'REWARD_APPROVED'
        },
        {
          label: 'Signed',
          status: 'DONE',
          infooookey: 'REWARD_SIGNED'
        },
        {
          label: 'Sent',
          status: 'DONE',
          infooookey: 'REWARD_SENT'
        },
      ]
    },
    {
      label: 'Completed',
      status: 'DONE',
      infooookey: 'COMPLETED'
    },
  ],
  CREATED: [
    {
      label: 'Created',
      status: 'DONE',
      infooookey: 'CREATED'
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
      infooookey: 'CREATED'
    },
    {
      label: 'Triggered',
      status: 'DONE',
      infooookey: 'TRIGGERED'
    },
    {
      label: 'Fraud',
      status: 'ERROR',
      infooookey: 'FRAUD'
    },
  ],
  MULTIPLE_FLOWS: [],
  PAID: [
    {
      label: 'Created',
      status: 'DONE',
      infooookey: 'CREATED'
    },
    {
      label: 'Triggered',
      status: 'DONE',
      infooookey: 'TRIGGERED'
    },
    {
      label: 'Paid',
      status: 'DONE',
      sub: [
        {
          label: 'Approved',
          status: 'DONE',
          infooookey: 'PAYMENT_APPROVED'
        },
        {
          label: 'Signed',
          status: 'DONE',
          infooookey: 'PAYMENT_SIGNED'
        },
        {
          label: 'Sent',
          status: 'DONE',
          infooookey: 'PAYMENT_SENT'
        },
      ]
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
      infooookey: 'CREATED'
    },
    {
      label: 'Triggered',
      status: 'DONE',
      infooookey: 'TRIGGERED'
    },
    {
      label: 'In Payment',
      status: 'PROGRESS',
      sub: [
        {
          label: 'Approved',
          status: 'DONE',
          infooookey: 'PAYMENT_APPROVED'
        },
        {
          label: 'Sign',
          status: 'PENDING',
        },
        {
          label: 'Send',
          status: 'PENDING',
        },
      ]
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
      infooookey: 'CREATED'
    },
    {
      label: 'Triggered',
      status: 'DONE',
      infooookey: 'TRIGGERED'
    },
    {
      label: 'In Payment',
      status: 'PROGRESS',
      sub: [
        {
          label: 'Approved',
          status: 'DONE',
          infooookey: 'PAYMENT_APPROVED'
        },
        {
          label: 'Signed',
          status: 'DONE',
          infooookey: 'PAYMENT_SIGNED'
        },
        {
          label: 'Sent',
          status: 'DONE',
          infooookey: 'PAYMENT_SENT'
        },
      ]
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
      infooookey: 'CREATED'
    },
    {
      label: 'Triggered',
      status: 'DONE',
      infooookey: 'TRIGGERED'
    },
    {
      label: 'In Payment',
      status: 'PROGRESS',
      sub: [
        {
          label: 'Approved',
          status: 'DONE',
          infooookey: 'PAYMENT_APPROVED'
        },
        {
          label: 'Signed',
          status: 'DONE',
          infooookey: 'PAYMENT_SIGNED'
        },
        {
          label: 'Send',
          status: 'PENDING',
        },
      ]
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
      infooookey: 'CREATED'
    },
    {
      label: 'Triggered',
      status: 'DONE',
      infooookey: 'TRIGGERED'
    },
    {
      label: 'In Payment',
      status: 'PROGRESS',
      sub: [
        {
          label: 'Approved',
          status: 'DONE',
          infooookey: 'PAYMENT_APPROVED'
        },
        {
          label: 'In Sign',
          status: 'PROGRESS',
          infooookey: 'PAYMENT_SIGNING'
        },
        {
          label: 'Send',
          status: 'PENDING',
        },
      ]
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
      infooookey: 'CREATED'
    },
    {
      label: 'Triggered',
      status: 'DONE',
      infooookey: 'TRIGGERED'
    },
    {
      label: 'Payment Stalled',
      status: 'PROGRESS',
      infooookey: 'PAYMENT_STALLED'
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
      infooookey: 'CREATED'
    },
    {
      label: 'Triggered',
      status: 'DONE',
      infooookey: 'TRIGGERED'
    },
    {
      label: 'Reached Limit',
      status: 'ERROR',
      infooookey: 'REACHED_LIMIT'
    },
  ],
  REJECTED: [
    {      
      label: 'Created',
      status: 'DONE',
      infooookey: 'CREATED'
    },
    {
      label: 'Triggered',
      status: 'DONE',
      infooookey: 'TRIGGERED'
    },
    {
      label: 'Rejected',
      status: 'ERROR',
      infooookey: 'REJECTED'
    },
  ],
  REWARD_APPROVED: [
    {
      label: 'Created',
      status: 'DONE',
      infooookey: 'CREATED'
    },
    {
      label: 'Triggered',
      status: 'DONE',
      infooookey: 'TRIGGERED'
    },
    {
      label: 'Paid',
      status: 'DONE',
      sub: [
        {
          label: 'Approved',
          status: 'DONE',
          infooookey: 'PAYMENT_APPROVED'
        },
        {
          label: 'Signed',
          status: 'DONE',
          infooookey: 'PAYMENT_SIGNED'
        },
        {
          label: 'Sent',
          status: 'DONE',
          infooookey: 'PAYMENT_SENT'
        },
      ]
    },
    {
      label: 'In Reward',
      status: 'PROGRESS',
      sub: [
        {
          label: 'Approved',
          status: 'DONE',
          infooookey: 'REWARD_APPROVED'
        },
        {
          label: 'Sign',
          status: 'PENDING',
        },
        {
          label: 'Send',
          status: 'PENDING',
        },
      ]
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
      infooookey: 'CREATED'
    },
    {
      label: 'Triggered',
      status: 'DONE',
      infooookey: 'TRIGGERED'
    },
    {
      label: 'Paid',
      status: 'DONE',
      sub: [
        {
          label: 'Approved',
          status: 'DONE',
          infooookey: 'PAYMENT_APPROVED'
        },
        {
          label: 'Signed',
          status: 'DONE',
          infooookey: 'PAYMENT_SIGNED'
        },
        {
          label: 'Sent',
          status: 'DONE',
          infooookey: 'PAYMENT_SENT'
        },
      ]
    },
    {
      label: 'In Reward',
      status: 'PROGRESS',
      sub: [
        {
          label: 'Approved',
          status: 'DONE',
          infooookey: 'REWARD_APPROVED'
        },
        {
          label: 'Signed',
          status: 'DONE',
          infooookey: 'REWARD_SIGNED'
        },
        {
          label: 'Sent',
          status: 'DONE',
          infooookey: 'REWARD_SENT'
        },
      ]
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
      infooookey: 'CREATED'
    },
    {
      label: 'Triggered',
      status: 'DONE',
      infooookey: 'TRIGGERED'
    },
    {
      label: 'Paid',
      status: 'DONE',
      sub: [
        {
          label: 'Approved',
          status: 'DONE',
          infooookey: 'PAYMENT_APPROVED'
        },
        {
          label: 'Signed',
          status: 'DONE',
          infooookey: 'PAYMENT_SIGNED'
        },
        {
          label: 'Sent',
          status: 'DONE',
          infooookey: 'PAYMENT_SENT'
        },
      ]
    },
    {
      label: 'In Reward',
      status: 'PROGRESS',
      sub: [
        {
          label: 'Approved',
          status: 'DONE',
          infooookey: 'REWARD_APPROVED'
        },
        {
          label: 'Signed',
          status: 'DONE',
          infooookey: 'REWARD_SIGNED'
        },
        {
          label: 'Send',
          status: 'PENDING',
        },
      ]
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
      infooookey: 'CREATED'
    },
    {
      label: 'Triggered',
      status: 'DONE',
      infooookey: 'TRIGGERED'
    },
    {
      label: 'Paid',
      status: 'DONE',
      sub: [
        {
          label: 'Approved',
          status: 'DONE',
          infooookey: 'PAYMENT_APPROVED'
        },
        {
          label: 'Signed',
          status: 'DONE',
          infooookey: 'PAYMENT_SIGNED'
        },
        {
          label: 'Sent',
          status: 'DONE',
          infooookey: 'PAYMENT_SENT'
        },
      ]
    },
    {
      label: 'In Reward',
      status: 'PROGRESS',
      sub: [
        {
          label: 'Approved',
          status: 'DONE',
          infooookey: 'REWARD_APPROVED'
        },
        {
          label: 'In Sign',
          status: 'PROGRESS',
          infooookey: 'REWARD_SIGNING'
        },
        {
          label: 'Send',
          status: 'PENDING',
        },
      ]
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
      infooookey: 'CREATED'
    },
    {
      label: 'Triggered',
      status: 'DONE',
      infooookey: 'TRIGGERED'
    },
    {
      label: 'Paid',
      status: 'DONE',
      sub: [
        {
          label: 'Approved',
          status: 'DONE',
          infooookey: 'PAYMENT_APPROVED'
        },
        {
          label: 'Signed',
          status: 'DONE',
          infooookey: 'PAYMENT_SIGNED'
        },
        {
          label: 'Sent',
          status: 'DONE',
          infooookey: 'PAYMENT_SENT'
        },
      ]
    },
    {
      label: 'Reward Stalled',
      status: 'PROGRESS',
      infooookey: 'REWARD_STALLED'
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
      infooookey: 'CREATED'
    },
    {
      label: 'Triggered',
      status: 'DONE',
      infooookey: 'TRIGGERED'
    },
    {
      label: 'Timeout',
      status: 'ERROR',
      infooookey: 'TIMEOUT'
    },
  ],
  TRIGGERED: [
    {
      label: 'Created',
      status: 'DONE',
      infooookey: 'CREATED'
    },
    {
      label: 'Triggered',
      status: 'DONE',
      infooookey: 'TRIGGERED'
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
  UNKNOWN: []
}

const aaaaa = (steps: Step[], timestamps) => {
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

      const description = INFO[step.infooookey];

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

      const sub = step.sub ? aaaaa(step.sub, timestamps) : undefined;

      const timestamp = timestamps[step.infooookey];

    return {color,description,icon,label,sub,timestamp}
  })
}

export const Process = ({ id }: { id: string }) => {
  const { data } = useSWR(
    `/v1/events/${id}`,
    fetcher,
  );

  const items = useMemo(() => {
    return aaaaa(FLOWS[data?.status] || [], data?.timestamps)
  }, [data]);

  return (
    <Section title="Progress">
      <pre>{JSON.stringify(items, null, 2)}</pre>
    </Section>
  );
};
