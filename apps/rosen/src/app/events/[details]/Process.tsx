import { ProcessTracker } from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import useSWR from 'swr';

import { Section } from './Section';

export const Process = ({ id }: { id: string }) => {
  const { error, data, isLoading, mutate } = useSWR(
    `/v1/events/${id}/process`,
    fetcher,
  );

  return (
    <Section collapsible error={error} load={mutate} title="Progress">
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
