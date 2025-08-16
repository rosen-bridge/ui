'use client';

import { useParams } from 'next/navigation';

import { Stack } from '@rosen-bridge/ui-kit';

import { Details } from '@/app/events/[details]/Details';
import { DetailsStepper } from '@/app/events/[details]/DetailsStepper';
import { Overview } from '@/app/events/[details]/Overview';
import { SourceTx } from '@/app/events/[details]/SourceTx';
import { Wids } from '@/app/events/[details]/Wids';

const Page = () => {
  const params = useParams();
  const eventId = params.details;

  return (
    <Stack display="flex" gap={2} flexDirection="column">
      <Overview id={`${eventId}`} />
      <Details id={`${eventId}`} />
      <DetailsStepper />
      <Wids />
      <SourceTx />
    </Stack>
  );
};

export default Page;
