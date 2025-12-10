import { forwardRef, HTMLAttributes } from 'react';

import { Button } from '@mui/material';
import { AngleRight } from '@rosen-bridge/icons';
import { Network as NetworkType } from '@rosen-ui/types';

import { Columns } from '../Columns';
import { Amount, Identifier, Label, LabelGroup, Network } from '../display';
import { InjectOverrides } from '../InjectOverrides';
import { RelativeTime } from '../RelativeTime';
import { Stack } from '../Stack';
import { SvgIcon } from '../SvgIcon';
import { Token } from '../Token';
import { EventStatus, EventStatusProps } from './EventStatus';

export type EventDetailsProps = HTMLAttributes<HTMLDivElement> & {
  showSeeDetailsButton?: boolean;
  value: {
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
    const { showSeeDetailsButton, value } = props;
    return (
      <Columns gap="32px" width="20rem" rule ref={ref}>
        {'id' in value && (
          <Label orientation="horizontal" label="Event Id">
            <Identifier copyable value={value.id} />
          </Label>
        )}
        {'status' in value && (
          <Label label="Status">
            <EventStatus value={value.status} />
          </Label>
        )}
        {'token' in value && (
          <Label label="Token">
            <Token reverse name={value.token} />
          </Label>
        )}
        {'amount' in value && (
          <Label label="Amount">
            <Amount value={value.amount} />
          </Label>
        )}
        {'fromChain' in value && 'toChain' in value && (
          <div>
            <Label label="Chain" />
            <LabelGroup>
              <Label label="From" inset>
                <Network name={value.fromChain} reverse />
              </Label>
              <Label label="To" inset>
                <Network name={value.toChain} reverse />
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
                    copyable={!!value.sourceTxId}
                    value={value.sourceTxId}
                    href={value.sourceTxIdUrl}
                  />
                </Label>
              )}
              {'paymentTxId' in value && (
                <Label label="Payment Tx" inset>
                  <Identifier
                    copyable={!!value.paymentTxId}
                    value={value.paymentTxId}
                    href={value.paymentTxIdUrl}
                  />
                </Label>
              )}
              {'spendTxId' in value && (
                <Label label="Reward Tx" inset>
                  <Identifier
                    copyable={!!value.spendTxId}
                    value={value.spendTxId}
                    href={value.spendTxIdUrl}
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
                />
              </Label>
              <Label label="To" inset>
                <Identifier
                  copyable
                  value={value.toAddress}
                  href={value.toAddressUrl}
                />
              </Label>
            </LabelGroup>
          </div>
        )}
        {'timestamp' in value && (
          <Label label="Time">
            <RelativeTime timestamp={value.timestamp} />
          </Label>
        )}
        {'bridgeFee' in value && (
          <Label label="Bridge Fee">
            <Amount value={value.bridgeFee} />
          </Label>
        )}
        {'networkFee' in value && (
          <Label label="Network Fee">
            <Amount value={value.networkFee} />
          </Label>
        )}
        {'reports' in value && <Label label="Reports">{value.reports}</Label>}
        {'height' in value && <Label label="Height">{value.height}</Label>}
        {showSeeDetailsButton && !!value?.href && (
          <Stack align="end">
            <Button
              variant="text"
              size="medium"
              target="_blank"
              href={value.href}
              endIcon={
                <SvgIcon>
                  <AngleRight />
                </SvgIcon>
              }
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
