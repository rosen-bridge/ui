'use client';

import { Stack } from '@rosen-bridge/ui-kit';

import { Details } from '@/app/events/[details]/Details';
import { DetailsStepper } from '@/app/events/[details]/DetailsStepper';
import { Overview } from '@/app/events/[details]/Overview';
import { SourceTx } from '@/app/events/[details]/SourceTx';
import { Wids } from '@/app/events/[details]/Wids';

const Page = () => {
  return (
    <Stack display="flex" gap={2} flexDirection="column">
      <Overview />
      <Details />
      <DetailsStepper />
      <Wids />
      <SourceTx />
    </Stack>
  );
};

export default Page;
