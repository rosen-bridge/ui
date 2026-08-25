'use client';

import { type CSSProperties, useMemo } from 'react';

import useSWR from 'swr';

import {
  Amount,
  Columns,
  Duration,
  Identifier,
  InvalidValue,
  Label,
  LabelGroup,
  useResponsive,
} from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import { fetcher } from '@rosen-ui/swr-helpers';
import { getTxURL } from '@rosen-ui/utils';

import type { EventDetailsType } from '@/backend/events/repository';

import { Section } from './Section';

export const TransactionsAndFees = ({ id, flowId }: { id: string; flowId: string | undefined }) => {
  const {
    error,
    data: events,
    isLoading,
    mutate,
  } = useSWR<EventDetailsType[]>(`/v1/events/${id}`, fetcher);

  const data = events?.find((event) => event.txId === flowId);

  const isCustomStatus = typeof data?.status === 'object';

  const txIds = useMemo(() => {
    return [
      {
        type: 'lock',
        label: 'Lock Tx',
        chain: data?.fromChain,
        txId: data?.sourceTxId,
        isInvalid: false,
      },
      {
        type: 'payment',
        label: 'Payment Tx',
        chain: data?.toChain,
        txId: data?.paymentTxId || undefined,
        isInvalid: isCustomStatus,
      },
      {
        type: 'reward',
        label: data?.status === 'FRAUD' ? 'Fraud Tx' : 'Reward Tx',
        chain: NETWORKS.ergo.key,
        txId: data?.spendTxId || undefined,
        isInvalid: isCustomStatus,
      },
      {
        type: 'trigger',
        label: 'Trigger Tx',
        chain: NETWORKS.ergo.key,
        txId: data?.txId,
        isInvalid: false,
      },
    ] as const;
  }, [data, isCustomStatus]);

  const boxStyle = useResponsive<CSSProperties>({
    mobile: { columnSpan: 'all' },
    desktop: { columnSpan: 'unset' },
  });

  const columnsCount = useResponsive({
    mobile: 1,
    tablet: 1,
    laptop: 2,
    desktop: 3,
  });

  return (
    <Section error={error} load={mutate} title="Transactions and Fees">
      <Columns gap="24px" count={columnsCount} rule>
        <div>
          <Label
            orientation="horizontal"
            label="Duration"
            info="How long it takes from when the lock transaction is recorded on the blockchain until the reward transaction is confirmed. (Note: the actual payment may arrive before this full interval.)"
          >
            {isCustomStatus ? (
              <InvalidValue />
            ) : (
              <Duration
                fallback="-"
                loading={isLoading}
                value={
                  data?.timestamps.COMPLETED && data?.timestamps.CREATED
                    ? (data.timestamps.COMPLETED - data.timestamps.CREATED) * 1000
                    : undefined
                }
              />
            )}
          </Label>
          <Label label="Total Emission">
            {isCustomStatus ? (
              <InvalidValue />
            ) : (
              <Amount style={{ height: '20px' }} loading={isLoading} fallback="-" />
            )}
          </Label>
          <Label label="Guards" inset>
            {isCustomStatus ? (
              <InvalidValue />
            ) : (
              <Amount style={{ height: '20px' }} loading={isLoading} fallback="-" />
            )}
          </Label>
          <Label label="Watchers" inset>
            {isCustomStatus ? (
              <InvalidValue />
            ) : (
              <Amount style={{ height: '20px' }} loading={isLoading} fallback="-" />
            )}
          </Label>
          <Label
            label="RSN Ratio"
            info="The number of RSN tokens that correspond to one unit of this token."
          >
            {isCustomStatus ? (
              <InvalidValue />
            ) : (
              <Amount style={{ height: '20px' }} loading={isLoading} fallback="-" />
            )}
          </Label>
        </div>
        <div>
          <Label label="Token Price">
            <Amount style={{ height: '20px' }} loading={isLoading} value={data?.price} unit="$" />
          </Label>
          <Label label="Fee Sum">
            <Amount
              loading={isLoading}
              value={data?.totalFee}
              decimal={data?.lockToken?.significantDecimal}
              unit={data?.lockToken?.name}
              price={data?.price}
            />
          </Label>
          <Label label="Bridge Fee" inset>
            <Amount
              loading={isLoading}
              value={data?.bridgeFee}
              decimal={data?.lockToken?.significantDecimal}
              unit={data?.lockToken?.name}
              price={data?.price}
            />
          </Label>
          <Label label="Network Fee" inset>
            <Amount
              loading={isLoading}
              value={data?.networkFee}
              decimal={data?.lockToken?.significantDecimal}
              unit={data?.lockToken?.name}
              price={data?.price}
            />
          </Label>
        </div>
        <div style={boxStyle}>
          <Label label="Tx IDs" />
          <LabelGroup>
            {txIds.map((item) => (
              <Label key={item.type} label={item.label} inset>
                {item.isInvalid ? (
                  <InvalidValue />
                ) : (
                  <Identifier
                    copyable
                    fallback="N/A"
                    href={getTxURL(item.chain, item.txId)}
                    loading={isLoading}
                    value={item.txId}
                    style={{ width: '90%' }}
                  />
                )}
              </Label>
            ))}
          </LabelGroup>
        </div>
      </Columns>
    </Section>
  );
};
