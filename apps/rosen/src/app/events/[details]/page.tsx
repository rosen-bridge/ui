'use client';

import { useParams } from 'next/navigation';

import { Stack } from '@rosen-bridge/ui-kit';

import {
  Details,
  DetailsStepper,
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
      <DetailsStepper />
      <Watchers />
      <SourceTx />
    </Stack>
  );
};

export default Page;
