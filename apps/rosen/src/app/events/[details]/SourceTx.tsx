'use client';

import React from 'react';

import {
  Card,
  CardBody,
  CopyButton,
  Skeleton,
  useDisclosure,
} from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import useSWR from 'swr';

import { Section } from './Section';

export type SourceTxProps = {
  id: string;
};

export const SourceTx = ({ id }: SourceTxProps) => {
  const { data, isLoading, mutate } = useSWR<string>(
    `/v1/events/${id}/metadata`,
    fetcher,
  );

  const disclosure = useDisclosure({
    onOpen: () => {
      void mutate();
      return Promise.resolve();
    },
  });

  return (
    <Section disclosure={disclosure} title="Source Tx Metadata">
      {isLoading && (
        <Skeleton
          variant="rounded"
          width="100%"
          height="210px"
          sx={{ display: 'block' }}
        />
      )}
      {!isLoading && data && (
        <Card backgroundColor="primary.light">
          <CardBody style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', right: 0, top: 10 }}>
              <CopyButton value={data} />
            </div>
            <pre style={{ paddingTop: '16px', overflow: 'hidden' }}>{data}</pre>
          </CardBody>
        </Card>
      )}
    </Section>
  );
};
