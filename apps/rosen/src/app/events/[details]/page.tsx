'use client';

import { useParams } from 'next/navigation';

import { Stack } from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import useSWR from 'swr';

import {
  Details,
  Process,
  Overview,
  SourceTx,
  Watchers,
} from '@/app/events/[details]';
import { EventDetails } from '@/app/events/[details]/type';

const Page = () => {
  const { details: eventId } = useParams();
  const { data, isLoading } = useSWR<EventDetails>(
    `/v1/events/${eventId}`,
    fetcher,
  );
  return (
    <Stack display="flex" gap={2} flexDirection="column">
      <Overview loading={isLoading} details={data} />
      <Details loading={isLoading} details={data} />
      <Process loading={isLoading} details={data} />
      <Watchers loading={isLoading} details={data} />
      <SourceTx loading={isLoading} details={data} />
    </Stack>
  );
};

export default Page;
