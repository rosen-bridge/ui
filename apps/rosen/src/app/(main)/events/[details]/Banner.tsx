'use client';

import useSWR from 'swr';

import { Alert, Truncate } from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';

import type { EventDetailsType } from '@/backend/events/repository';

export const Banner = ({ id, flowId }: { id: string; flowId: string | undefined }) => {
  const { data: events } = useSWR<EventDetailsType[]>(`/v1/events/${id}`, fetcher);

  const data = events?.find((event) => event.txId === flowId);

  const warning = typeof data?.status === 'object' ? data.status.reason : undefined;

  if (!warning) return null;

  return (
    <Alert severity="warning">
      <Truncate expandable lines={3}>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: Keep this */}
        <div dangerouslySetInnerHTML={{ __html: warning }}></div>
      </Truncate>
    </Alert>
  );
};
