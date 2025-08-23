'use client';

import { useParams } from 'next/navigation';

import { Stack } from '@rosen-bridge/ui-kit';

import {
  Details,
  DetailsProcess,
  Overview,
  SourceTx,
  Watchers,
} from '@/app/events/[details]';

const Page = () => {
  const { details: eventId } = useParams();

  return (
    <Stack display="flex" gap={2} flexDirection="column">
      <Overview id={eventId as string} />
      <Details id={eventId as string} />
      <DetailsProcess />
      <Watchers />
      <SourceTx />
    </Stack>
  );
};

export default Page;
