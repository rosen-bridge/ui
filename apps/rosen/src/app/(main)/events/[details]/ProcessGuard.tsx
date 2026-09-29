'use client';

import { useMemo, useState } from 'react';

import useSWR from 'swr';

import { type Color, Rail, Typography } from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';

import type { EventDetailsType, EventGuardStatusType } from '@/backend/events/repository';

import { ProcessGuardDetails } from './ProcessGuardDetails';
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
    label: 'Entry',
    steps: [
      {
        label: 'Idle',
        statuses: [
          {
            key: 'UNKNOWN',
            color: 'neutral-dark',
          },
          {
            key: 'REJECTED',
            color: 'error-dark',
          },
        ],
      },
    ],
  },
  {
    label: 'Payment',
    steps: [
      {
        label: 'Deliberation',
        statuses: [
          {
            key: 'PAYMENT_PENDING',
            color: 'neutral-dark',
          },
          {
            key: 'PAYMENT_STALLED',
            color: 'warning-dark',
          },
          {
            key: 'TIMEOUT',
            color: 'error-dark',
          },
          {
            key: 'REACHED_LIMIT',
            color: 'error-dark',
          },
        ],
      },
      {
        label: 'Approval',
        statuses: [
          {
            key: 'PAYMENT_APPROVED',
            color: 'success-dark',
          },
        ],
      },
      {
        label: 'Signature',
        statuses: [
          {
            key: 'PAYMENT_SIGNING',
            color: 'info-dark',
          },
          {
            key: 'PAYMENT_SIGN_FAILED',
            color: 'info-dark',
          },
          {
            key: 'PAYMENT_SIGNED',
            color: 'success-dark',
          },
        ],
      },
      {
        label: 'Submission',
        statuses: [
          {
            key: 'PAYMENT_SENT',
            color: 'info-dark',
          },
          {
            key: 'PAID',
            color: 'success-dark',
          },
        ],
      },
    ],
  },
  {
    label: 'Reward',
    steps: [
      {
        label: 'Deliberation',
        statuses: [
          {
            key: 'REWARD_PENDING',
            color: 'neutral-dark',
          },
          {
            key: 'REWARD_STALLED',
            color: 'warning-dark',
          },
        ],
      },
      {
        label: 'Approval',
        statuses: [
          {
            key: 'REWARD_APPROVED',
            color: 'success-dark',
          },
        ],
      },
      {
        label: 'Signature',
        statuses: [
          {
            key: 'REWARD_SIGNING',
            color: 'info-dark',
          },
          {
            key: 'REWARD_SIGN_FAILED',
            color: 'info-dark',
          },
          {
            key: 'REWARD_SIGNED',
            color: 'success-dark',
          },
        ],
      },
      {
        label: 'Submission',
        statuses: [
          {
            key: 'REWARD_SENT',
            color: 'info-dark',
          },
          {
            key: 'REWARDED',
            color: 'success-dark',
          },
        ],
      },
    ],
  },
  {
    label: 'Outcome',
    steps: [
      {
        label: 'Conclusion',
        statuses: [
          {
            key: 'COMPLETED',
            color: 'success-dark',
          },
          {
            key: 'SPENT',
            color: 'warning-dark',
          },
        ],
      },
    ],
  },
];

export const ProcessGuard = ({ id, flowId }: { id: string; flowId: string | undefined }) => {
  const { data: events } = useSWR<EventDetailsType[]>(`/v1/events/${id}`, fetcher);

  const event = events?.find((event) => !flowId || event.triggerTxId === flowId);

  const isCustomStatus = typeof event?.status === 'object';

  const { data, error, isLoading, mutate } = useSWR<EventGuardStatusType[]>(
    flowId && !isCustomStatus ? `/v1/events/${id}/guards?triggerTxId=${flowId}` : null,
    fetcher,
  );

  const [selectedGuard, setSelectedGuard] = useState<string | undefined>(undefined);

  const loading = isLoading || !event;

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
              onClick: () => setSelectedGuard(guard.key),
            };
          })
          .filter((guard) => guard !== undefined),
      })),
    }));
  }, [data]);

  return (
    <Section error={error} load={mutate} title="Guards Progress" style={{ marginTop: '-40px' }}>
      {isCustomStatus ? (
        <Typography>
          No progress chart is available because this event deviated from the standard lifecycle.
          The reason for this exception is noted above.
        </Typography>
      ) : (
        <>
          <Rail stages={stages} loading={loading} />
          <ProcessGuardDetails
            id={id}
            flowId={flowId}
            guards={guards}
            guardKey={selectedGuard}
            open={!!selectedGuard}
            onClose={() => setSelectedGuard(undefined)}
            onGuardChange={setSelectedGuard}
          />
        </>
      )}
    </Section>
  );
};
