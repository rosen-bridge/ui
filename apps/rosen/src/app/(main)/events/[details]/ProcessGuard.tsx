'use client';

import { useMemo } from 'react';

import useSWR from 'swr';

import { type Color, Rail } from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';

import type { EventGuardStatusType } from '@/backend/events/repository';

import { Section } from './Section';

const guards = JSON.parse(process.env.NEXT_PUBLIC_ALLOWED_PKS ?? '[]') as Array<{
  key: string;
  label: string;
}>;

const layout: Array<{
  label: string;
  steps: Array<{
    label: string;
    statuses: { key: EventGuardStatusType['status']; color?: Color }[];
  }>;
}> = [
  {
    label: 'Out',
    steps: [
      {
        label: 'Out',
        statuses: [
          {
            key: 'UNKNOWN',
            color: 'neutral',
          },
          {
            key: 'REJECTED',
            color: 'error',
          },
        ],
      },
    ],
  },
  {
    label: 'Payment',
    steps: [
      {
        label: 'Pending',
        statuses: [
          {
            key: 'PAYMENT_PENDING',
            color: 'neutral',
          },
          {
            key: 'PAYMENT_STALLED',
            color: 'warning',
          },
          {
            key: 'TIMEOUT',
            color: 'error',
          },
          {
            key: 'REACHED_LIMIT',
            color: 'error',
          },
        ],
      },
      {
        label: 'Approval',
        statuses: [
          {
            key: 'PAYMENT_APPROVED',
            color: 'success',
          },
        ],
      },
      {
        label: 'Signing',
        statuses: [
          {
            key: 'PAYMENT_SIGNING',
            color: 'info',
          },
          {
            key: 'PAYMENT_SIGN_FAILED',
            color: 'info',
          },
          {
            key: 'PAYMENT_SIGNED',
            color: 'success',
          },
        ],
      },
      {
        label: 'Sending',
        statuses: [
          {
            key: 'PAYMENT_SENT',
            color: 'info',
          },
          {
            key: 'PAID',
            color: 'success',
          },
        ],
      },
    ],
  },
  {
    label: 'Reward',
    steps: [
      {
        label: 'Pending',
        statuses: [
          {
            key: 'REWARD_PENDING',
            color: 'neutral',
          },
          {
            key: 'REWARD_STALLED',
            color: 'warning',
          },
        ],
      },
      {
        label: 'Approval',
        statuses: [
          {
            key: 'REWARD_APPROVED',
            color: 'success',
          },
        ],
      },
      {
        label: 'Signing',
        statuses: [
          {
            key: 'REWARD_SIGNING',
            color: 'info',
          },
          {
            key: 'REWARD_SIGN_FAILED',
            color: 'info',
          },
          {
            key: 'REWARD_SIGNED',
            color: 'success',
          },
        ],
      },
      {
        label: 'Sending',
        statuses: [
          {
            key: 'REWARD_SENT',
            color: 'info',
          },
          {
            key: 'REWARDED',
            color: 'success',
          },
        ],
      },
    ],
  },
  {
    label: 'Result',
    steps: [
      {
        label: 'Done',
        statuses: [
          {
            key: 'COMPLETED',
            color: 'success',
          },
          {
            key: 'SPENT',
            color: 'warning',
          },
        ],
      },
    ],
  },
];

export const ProcessGuard = ({ id, flowId }: { id: string; flowId: string | undefined }) => {
  const { data, error, isLoading, mutate } = useSWR<EventGuardStatusType[]>(
    flowId ? `/v1/events/${id}/guards?triggerTxId=${flowId}` : null,
    fetcher,
  );

  const loading = isLoading || !flowId;

  const stages = useMemo(() => {
    return layout.map((stage) => ({
      label: stage.label,
      steps: stage.steps.map((step) => ({
        label: step.label,
        tags: guards
          .map((guard) => {
            const status = data?.find((item) => item.guardPublicKey === guard.key)?.status;

            const slot = step.statuses.find((slot) => slot.key === status);

            if (!slot) return undefined;

            return {
              label: guard.label,
              color: slot.color,
            };
          })
          .filter((guard) => guard !== undefined),
      })),
    }));
  }, [data]);

  return (
    <Section error={error} load={mutate} title="Guards Progress" style={{ marginTop: '-40px' }}>
      <Rail stages={stages} loading={loading} />
    </Section>
  );
};
