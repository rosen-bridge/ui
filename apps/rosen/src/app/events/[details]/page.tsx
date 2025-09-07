'use client';

import { useParams } from 'next/navigation';
import React from 'react';

import { Stack } from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import useSWR from 'swr';

import { Details } from './Details';
import { Overview } from './Overview';
import { Process } from './Process';
import { SourceTx } from './SourceTx';
import { EventDetails } from './type';
import { Watchers } from './Watchers';

const Sections: React.ComponentType[] = [
  Overview,
  Details,
  Process,
  Watchers,
  SourceTx,
];

const Page = () => {
  const { details: eventId } = useParams();
  const { data, isLoading } = useSWR<EventDetails>(
    `/v1/events/${eventId}`,
    fetcher,
  );
  const ComponentProps = { loading: isLoading, details: data };

  return (
    <Stack display="flex" gap={2} flexDirection="column">
      {Sections.map((S, i) => (
        <S key={i} {...ComponentProps} />
      ))}
    </Stack>
  );
};

export default Page;
