'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

import useSWR from 'swr';

import { Stack } from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';

import type { EventDetailsType } from '@/backend/events/repository';

import { Banner } from './Banner';
import { EventNotFound } from './EventNotFound';
import { Overview } from './Overview';
import { Process } from './Process';
import { ProcessGuard } from './ProcessGuard';
import { SourceTx } from './SourceTx';
import { TransactionsAndFees } from './TransactionsAndFees';
import { Watchers } from './Watchers';

const Page = () => {
  const { details: id } = useParams<{ details: string }>();

  const [flowId, setFlowId] = useState<string | undefined>();

  const { error, mutate } = useSWR<EventDetailsType[]>(`/v1/events/${id}`, fetcher, {
    shouldRetryOnError: (error) => !error?.response?.status || error.response.status >= 500,
  });

  const status = error?.response?.status;

  if (status === 400 || status === 404) {
    return <EventNotFound onRetry={() => mutate()} />;
  }

  return (
    <Stack spacing={2} direction="column">
      <Banner id={id} flowId={flowId} />
      <Overview id={id} flowId={flowId} onFlowIdChange={setFlowId} />
      <TransactionsAndFees id={id} flowId={flowId} />
      <Process id={id} flowId={flowId} />
      <ProcessGuard id={id} flowId={flowId} />
      <Watchers />
      <SourceTx />
    </Stack>
  );
};

export default Page;
