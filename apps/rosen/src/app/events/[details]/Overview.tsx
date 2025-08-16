'use client';

import React, { useEffect } from 'react';

import {
  Amount2,
  Columns,
  Connector,
  Identifier,
  Label,
  Network,
  RelativeTime,
  Stack,
  Token,
  useBreakpoint,
} from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import useSWR from 'swr';

import { DetailsCard } from '@/app/events/[details]/DetailsCard';
import { ProgressStatus } from '@/app/events/[details]/ProgressStatus';
import { EventItem } from '@/types';

export const Overview = ({ id }: { id: string }) => {
  const isMobile = useBreakpoint('tablet-down');

  const { data, isLoading, error } = useSWR<EventItem>(
    `/v1/events/${id}`,
    fetcher,
  );
  useEffect(() => {
    console.log(data);
  }, [data, isLoading, error]);
  return (
    <DetailsCard state="open" title="Overview">
      <Label
        orientation={isMobile ? 'horizontal' : 'vertical'}
        label="Event Id"
      >
        {/*TODO: Fix Identifier responsive */}
        <div
          style={{
            width: '100%',
            maxWidth: isMobile ? '300px' : '400px',
          }}
        >
          {data && <Identifier value={data?.eventId || 'TODO'} copyable />}
        </div>
      </Label>
      {/*Identifier*/}
      <Columns count={3} width="320px" gap="8px">
        <Label orientation={isMobile ? 'horizontal' : 'vertical'} label="Chin">
          <Stack alignItems="center">
            {data && (
              <Connector
                start={<Network name={data?.fromChain} />}
                end={<Network name={data?.toChain} />}
              />
            )}
          </Stack>
        </Label>
        <Label orientation={isMobile ? 'horizontal' : 'vertical'} label="Time">
          {data && <RelativeTime timestamp={data?.timestamp || 1755841} />}
        </Label>

        {/*Chip*/}

        <Label
          orientation={isMobile ? 'horizontal' : 'vertical'}
          label="Status"
        >
          <ProgressStatus state="completed" />
        </Label>
        <Label orientation={isMobile ? 'horizontal' : 'vertical'} label="Token">
          {/*TODO: diff type sourceChainTokenId*/}
          <Token name={'as'} reverse={isMobile} />
        </Label>

        <Label
          orientation={isMobile ? 'horizontal' : 'vertical'}
          label="Amount"
        >
          {/*TODO: diff type sourceChainTokenId*/}
          <Amount2
            value={data?.amount}
            orientation={'horizontal'}
            unit={'as'}
          />
        </Label>
        <Label
          orientation={isMobile ? 'horizontal' : 'vertical'}
          label="Fee Sum"
        >
          {/*TODO: diff type sourceChainTokenId*/}
          <Amount2
            value={data?.networkFee}
            orientation={'horizontal'}
            unit={'as'}
          />
        </Label>
      </Columns>

      <div>
        <Label label="Address"></Label>
        <Label label="from" inset>
          <Identifier value={data?.fromAddress || 'TODO'} copyable />
        </Label>
        <Label label="to" inset>
          <Identifier value={data?.toAddress || 'TODO'} copyable />
        </Label>
      </div>
    </DetailsCard>
  );
};
