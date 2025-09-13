'use client';

import { useParams } from 'next/navigation';
import React from 'react';

import { Stack, TryAgain } from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import useSWR from 'swr';

import { Details } from './Details';
import { Overview } from './Overview';
import { Process } from './Process';
import { SourceTx } from './SourceTx';
import { Watchers } from './Watchers';

const Sections: {
  component: React.ComponentType<any>;
  needsData?: boolean;
  error?: boolean;
}[] = [
  { component: Overview, needsData: true },
  { component: Details, needsData: true },
  { component: Process, needsData: false },
  { component: Watchers, needsData: false },
  { component: SourceTx, needsData: false },
];
/**
 * */
const Page = () => {
  const { details: eventId } = useParams();
  const { data, isLoading, mutate, error } = useSWR(
    `/v1/events/${eventId}`,
    fetcher,
  );

  const ComponentProps = {
    loading: isLoading,
    details: data,
    error: error ? <TryAgain onClick={() => mutate()} /> : null,
  };

  return (
    <Stack display="flex" gap={2} flexDirection="column">
      {Sections.map(({ component: S, needsData }, i) => (
        <S key={i} {...(needsData ? ComponentProps : { id: eventId })} />
      ))}
    </Stack>
  );
};

export default Page;
