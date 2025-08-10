'use client';

import { Fragment } from 'react';

import { Columns, Stack } from '@rosen-bridge/ui-kit';

import { Details } from '@/app/events/[details]/Details';
import { Overview } from '@/app/events/[details]/Overview';
import { SourceTx } from '@/app/events/[details]/SourceTx';
import { StepperEvent } from '@/app/events/[details]/stepper/Stepper';
import { Wids } from '@/app/events/[details]/Wids';

const Page = () => {
  return (
    <Stack display="flex" gap={2} flexDirection="column">
      <Overview />
      <Details />
      <StepperEvent />
      <Wids />
      <SourceTx />
    </Stack>
  );
};

export default Page;
