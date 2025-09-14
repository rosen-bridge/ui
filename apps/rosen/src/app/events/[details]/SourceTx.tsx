'use client';

import { Card, CardBody, CopyButton, Skeleton } from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import useSWR from 'swr';

import { Section } from './Section';

export const SourceTx = ({ id }: { id: string }) => {
  const { data, error, isLoading, mutate } = useSWR<string>(
    `/v1/events/${id}/metadata`,
    fetcher,
  );

  return (
    <Section collapsible error={error} load={mutate} title="Source Tx Metadata">
      {isLoading && (
        <Skeleton
          variant="rounded"
          width="100%"
          height="210px"
          style={{ display: 'block' }}
        />
      )}
      {!isLoading && (
        <Card backgroundColor="primary.light">
          <CardBody style={{ position: 'relative' }}>
            <CopyButton
              value={data || ''}
              style={{ position: 'absolute', right: '1rem', top: '1rem' }}
            />
            <pre style={{ paddingTop: '1rem', overflow: 'hidden' }}>{data}</pre>
          </CardBody>
        </Card>
      )}
    </Section>
  );
};
