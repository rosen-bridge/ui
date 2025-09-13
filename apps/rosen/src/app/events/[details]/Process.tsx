import React from 'react';

import { ProcessTracker, useDisclosure } from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import useSWR from 'swr';

import { Section } from './Section';

export const Process = ({ id }: { id: string }) => {
  const { data, isLoading, mutate } = useSWR(
    `/v1/events/${id}/process`,
    fetcher,
  );

  const disclosure = useDisclosure({
    onOpen: () => {
      void mutate();
      return Promise.resolve();
    },
  });

  return (
    <Section disclosure={disclosure} title="Progress">
      <ProcessTracker
        orientation="vertical"
        loading={isLoading}
        steps={data?.steps}
        overrides={{
          laptop: {
            orientation: 'horizontal',
          },
        }}
      />
    </Section>
  );
};
