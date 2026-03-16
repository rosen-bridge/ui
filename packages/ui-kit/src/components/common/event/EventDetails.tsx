import { forwardRef, HTMLAttributes } from 'react';

import { Button } from '@mui/material';
import { Network as NetworkType } from '@rosen-ui/types';

import { Columns } from '../../columns';
import { EventStatus, EventStatusProps } from '../../eventStatus';
import { Icon } from '../../icon';
import { Identifier } from '../../identifier';
import { LabelGroup } from '../../labelGroup';
import { Network } from '../../network';
import { Stack } from '../../stack';
import { Text } from '../../text';
import { Token } from '../../token';
import { Amount, Label } from '../display';
import { InjectOverrides } from '../InjectOverrides';
import { RelativeTime } from '../RelativeTime';

export type EventDetailsProps = HTMLAttributes<HTMLDivElement> & {
  loading?: boolean;
  showSeeDetailsButton?: boolean;
  value: {
    price?: number;
    decimal?: number;
    amount?: string;
    bridgeFee?: string;
    fromAddress?: string;
    fromAddressUrl?: string;
    fromChain?: NetworkType;
    height?: number;
    href?: string;
    id?: string;
    networkFee?: string;
    reports?: number;
    sourceTxId?: string;
    sourceTxIdUrl?: string;
    status?: EventStatusProps['value'];
    toAddress?: string;
    toAddressUrl?: string;
    toChain?: NetworkType;
    token?: string;
    paymentTxId?: string;
    paymentTxIdUrl?: string;
    spendTxId?: string;
    spendTxIdUrl?: string;
    timestamp?: number;
  };
};

const EventDetailsBase = forwardRef<HTMLDivElement, EventDetailsProps>(
  (props, ref) => {
    const { loading, showSeeDetailsButton, value } = props;
    return (
      <Columns gap="32px" width="20rem" rule ref={ref}>
        {'id' in value && (
          <Label orientation="horizontal" label="Event Id">
            <Identifier copyable value={value.id} loading={loading} />
          </Label>
        )}
        {'status' in value && (
          <Label label="Status">
            <EventStatus value={value.status} loading={loading} />
          </Label>
        )}
        {'token' in value && (
          <Label label="Token">
            <Token variant="reverse" value={value.token} loading={loading} />
          </Label>
        )}
        {'amount' in value && (
          <Label label="Amount">
            <Amount
              decimal={value.decimal}
              loading={loading}
              price={value.price}
              value={value.amount}
            />
          </Label>
        )}
        {'fromChain' in value && 'toChain' in value && (
          <div>
            <Label label="Chain" />
            <LabelGroup>
              <Label label="From" inset>
                <Network
                  value={value.fromChain}
                  variant="reverse"
                  loading={loading}
                />
              </Label>
              <Label label="To" inset>
                <Network
                  value={value.toChain}
                  variant="reverse"
                  loading={loading}
                />
              </Label>
            </LabelGroup>
          </div>
        )}
        {'sourceTxId' in value ||
        'paymentTxId' in value ||
        'spendTxId' in value ? (
          <div>
            <Label label="Tx ID" />
            <LabelGroup>
              {'sourceTxId' in value && (
                <Label label="Lock Tx" inset>
                  <Identifier
                    copyable
                    value={value.sourceTxId}
                    href={value.sourceTxIdUrl}
                    loading={loading}
                  />
                </Label>
              )}
              {'paymentTxId' in value && (
                <Label label="Payment Tx" inset>
                  <Identifier
                    copyable
                    value={value.paymentTxId}
                    href={value.paymentTxIdUrl}
                    loading={loading}
                  />
                </Label>
              )}
              {'spendTxId' in value && (
                <Label label="Reward Tx" inset>
                  <Identifier
                    copyable
                    value={value.spendTxId}
                    href={value.spendTxIdUrl}
                    loading={loading}
                  />
                </Label>
              )}
            </LabelGroup>
          </div>
        ) : null}
        {'fromAddress' in value && 'toAddress' in value && (
          <div>
            <Label label="Address" />
            <LabelGroup>
              <Label label="From" inset>
                <Identifier
                  copyable
                  value={value.fromAddress}
                  href={value.fromAddressUrl}
                  loading={loading}
                />
              </Label>
              <Label label="To" inset>
                <Identifier
                  copyable
                  value={value.toAddress}
                  href={value.toAddressUrl}
                  loading={loading}
                />
              </Label>
            </LabelGroup>
          </div>
        )}
        {'timestamp' in value && (
          <Label label="Time">
            <RelativeTime timestamp={value.timestamp} isLoading={loading} />
          </Label>
        )}
        {'bridgeFee' in value && (
          <Label label="Bridge Fee">
            <Amount
              decimal={value.decimal}
              loading={loading}
              price={value.price}
              value={value.bridgeFee}
            />
          </Label>
        )}
        {'networkFee' in value && (
          <Label label="Network Fee">
            <Amount
              decimal={value.decimal}
              loading={loading}
              price={value.price}
              value={value.networkFee}
            />
          </Label>
        )}
        {'reports' in value && (
          <Label label="Reports">
            <Text loading={loading}>{value.reports}</Text>
          </Label>
        )}
        {'height' in value && (
          <Label label="Height">
            <Text loading={loading}>{value.height}</Text>
          </Label>
        )}
        {showSeeDetailsButton && !!value?.href && (
          <Stack align="end">
            <Button
              variant="text"
              size="medium"
              target="_blank"
              href={value.href}
              loading={loading}
              endIcon={<Icon name="AngleRight" />}
            >
              SEE DETAILS
            </Button>
          </Stack>
        )}
      </Columns>
    );
  },
);

EventDetailsBase.displayName = 'EventDetails';

export const EventDetails = InjectOverrides(EventDetailsBase);
