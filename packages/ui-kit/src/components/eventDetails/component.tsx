import {
  Amount,
  AmountProps,
  Columns,
  EventStatus,
  EventStatusProps,
  Identifier,
  IdentifierProps,
  Label,
  LabelGroup,
  Network,
  NetworkProps,
  RelativeTime,
  RelativeTimeProps,
  Token,
  TokenProps,
  Typography,
} from '@/components';
import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface EventDetailsOverrides {}

export type EventDetailsOwnProps = {
  loading?: boolean;
  value: {
    amount?: AmountProps['value'];
    bridgeFee?: AmountProps['value'];
    decimal?: AmountProps['decimal'];
    fromAddress?: IdentifierProps['value'];
    fromAddressUrl?: IdentifierProps['href'];
    fromChain?: NetworkProps['value'];
    height?: number;
    id?: IdentifierProps['value'];
    networkFee?: AmountProps['value'];
    paymentTxId?: IdentifierProps['value'];
    paymentTxIdUrl?: IdentifierProps['href'];
    price?: AmountProps['price'];
    reports?: number;
    spendTxId?: IdentifierProps['value'];
    spendTxIdUrl?: IdentifierProps['href'];
    sourceTxId?: IdentifierProps['value'];
    sourceTxIdUrl?: IdentifierProps['href'];
    status?: EventStatusProps['value'];
    toAddress?: IdentifierProps['value'];
    toAddressUrl?: IdentifierProps['href'];
    toChain?: NetworkProps['value'];
    timestamp?: RelativeTimeProps['value'];
    token?: TokenProps['value'];
  };
};

export type EventDetailsBaseProps = ElementBaseProps<
  typeof Columns,
  EventDetailsOwnProps
>;

export type EventDetailsProps = OverridableType<
  EventDetailsBaseProps,
  EventDetailsOverrides,
  never
>;

export const EventDetails = (props: EventDetailsProps) => {
  const { loading, value, ...rest } = useConfig('EventDetails', props);

  return (
    <Columns gap={4} width="20rem" rule {...rest}>
      {'id' in value && (
        <Label orientation="horizontal" label="Event Id">
          <Identifier copyable loading={loading} value={value.id} />
        </Label>
      )}
      {'status' in value && (
        <Label label="Status">
          <EventStatus loading={loading} value={value.status} />
        </Label>
      )}
      {'token' in value && (
        <Label label="Token">
          <Token loading={loading} value={value.token} variant="reverse" />
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
      {('sourceTxId' in value ||
        'paymentTxId' in value ||
        'spendTxId' in value) && (
        <div>
          <Label label="Tx ID" />
          <LabelGroup>
            {'sourceTxId' in value && (
              <Label label="Lock Tx" inset>
                <Identifier
                  copyable
                  href={value.sourceTxIdUrl}
                  loading={loading}
                  value={value.sourceTxId}
                />
              </Label>
            )}
            {'paymentTxId' in value && (
              <Label label="Payment Tx" inset>
                <Identifier
                  copyable
                  href={value.paymentTxIdUrl}
                  loading={loading}
                  value={value.paymentTxId}
                />
              </Label>
            )}
            {'spendTxId' in value && (
              <Label label="Reward Tx" inset>
                <Identifier
                  copyable
                  href={value.spendTxIdUrl}
                  loading={loading}
                  value={value.spendTxId}
                />
              </Label>
            )}
          </LabelGroup>
        </div>
      )}
      {'fromAddress' in value && 'toAddress' in value && (
        <div>
          <Label label="Address" />
          <LabelGroup>
            <Label label="From" inset>
              <Identifier
                copyable
                href={value.fromAddressUrl}
                loading={loading}
                value={value.fromAddress}
              />
            </Label>
            <Label label="To" inset>
              <Identifier
                copyable
                href={value.toAddressUrl}
                loading={loading}
                value={value.toAddress}
              />
            </Label>
          </LabelGroup>
        </div>
      )}
      {'timestamp' in value && (
        <Label label="Time">
          <RelativeTime loading={loading} value={value.timestamp} />
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
          <Typography component="div" loading={loading}>
            {value.reports}
          </Typography>
        </Label>
      )}
      {'height' in value && (
        <Label label="Height">
          <Typography component="div" loading={loading}>
            {value.height}
          </Typography>
        </Label>
      )}
    </Columns>
  );
};

EventDetails.displayName = 'EventDetails';
