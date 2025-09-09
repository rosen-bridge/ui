'use client';

import React from 'react';

import {
  Card,
  CardBody,
  CopyButton,
  DisclosureButton,
  Skeleton,
  useDisclosure,
} from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import useSWR from 'swr';

import { Section } from './Section';
import { EventDetails } from './type';

export const SourceTx = ({ id }: { id: string }) => {
  const {
    data: details,
    isLoading,
    mutate,
  } = useSWR<EventDetails>(`/v1/events/${id}/metadata`, fetcher);

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
      title="Source Tx Metadata"
    >
      {!isLoading && details ? (
        <Card backgroundColor="primary.light">
          <CardBody>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', right: 0, top: 10 }}>
                <CopyButton value={details.metadata} />
              </div>
              <pre style={{ paddingTop: '16px', overflow: 'hidden' }}>
                {details.metadata}
              </pre>
            </div>
          </CardBody>
        </Card>
      ) : (
        <Skeleton
          variant="rounded"
          width="100%"
          height="210px"
          sx={{ display: 'block' }}
        />
      )}
    </Section>
  );
};
