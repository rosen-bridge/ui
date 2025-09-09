import React from 'react';

import {
  DisclosureButton,
  ProcessTracker,
  useDisclosure,
} from '@rosen-bridge/ui-kit';
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
    <Section
      action={<DisclosureButton disabled={false} disclosure={disclosure} />}
      state={disclosure.state}
      title="Progress"
    >
      <ProcessTracker
        orientation="vertical"
        loading={isLoading}
        steps={data?.steps}
        style={{
          minHeight: '210px',
          height: isLoading ? '210px' : 'unset',
          width: '100%',
        }}
        overrides={{
          laptop: {
            orientation: 'horizontal',
          },
        }}
      />
    </Section>
  );
};
