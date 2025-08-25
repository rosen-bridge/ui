'use client';

import { useParams } from 'next/navigation';

import { Stack } from '@rosen-bridge/ui-kit';

import {
  Details,
  Process,
  Overview,
  SourceTx,
  Watchers,
} from '@/app/events/[details]';

const Page = () => {
  const { details: eventId } = useParams();

  return (
    <Stack display="flex" gap={2} flexDirection="column">
      {/*TODO: fix ids*/}
      <Overview id={eventId as string} />
      <Details id={eventId as string} />
      <Process />
      <Watchers />
      <SourceTx id={eventId as string} />
    </Stack>
  );
};

export default Page;
