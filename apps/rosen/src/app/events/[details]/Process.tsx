'use client';

import { Section } from './Section';
import useSWR from 'swr';
import { fetcher } from '@rosen-ui/swr-helpers';

export const Process = ({ id }: { id: string }) => {
  const { data } = useSWR(
    `/v1/events/${id}`,
    fetcher,
  );
  return (
    <Section title="Progress">
      <pre>{JSON.stringify(data?.timestamps || {}, null, 2)}</pre>
    </Section>
  );
};
