'use client';

import { useParams } from 'next/navigation';

import { Stack } from '@rosen-bridge/ui-kit';

import { Details } from './Details';
import { Overview } from './Overview';
import { Process } from './Process';
import { SourceTx } from './SourceTx';
import { Watchers } from './Watchers';

const Page = () => {
  const { details } = useParams();

  const id = details as string;

  return (
    <Stack display="flex" gap={2} flexDirection="column">
      <Overview id={id} />
      <Details id={id} />
      <Process id={id} />
      <Watchers id={id} />
      <SourceTx id={id} />
    </Stack>
  );
};

export default Page;
