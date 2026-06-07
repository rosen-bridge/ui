'use client';

import {
  Center,
  Stack,
  Typography,
  UnderDevelopSection,
} from '@rosen-bridge/ui-kit';

import { Section } from './Section';
import useSWR from 'swr';
import { fetcher } from '@rosen-ui/swr-helpers';

export const Process = ({ id }: { id: string }) => {
  const { error, data, isLoading, mutate } = useSWR(
    `/v1/events/${id}`,
    fetcher,
  );
  return (
    <Section title="Progress">
      <pre>{JSON.stringify(data?.timestamps || {}, null, 2)}</pre>
    </Section>
  );
};
