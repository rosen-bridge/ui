'use client';

import {
  Alert,
  Amount,
  Card,
  CardBody,
  Divider,
  Label,
  Truncate,
} from '@rosen-bridge/ui-kit';

import {
  useBridgeFormValues,
  useTokenMap,
  useTransactionFees,
} from '@/hooks';

/**
 * shows fees to the user and handles wallet transaction
 * and wallet connection
 */
export const TransactionInfo = () => {
  const { source, target, token } = useBridgeFormValues();

  const tokenMap = useTokenMap();

  const {
    error,
    networkFeeRaw,
    bridgeFeeRaw,
    receivingAmountRaw,
    isLoading,
    minTransferRaw,
  } = useTransactionFees();

  const targetTokenSearchResults = source && token?.tokenId
    ? tokenMap.search(source, { tokenId: token.tokenId })
    : undefined;

  const targetToken = target && targetTokenSearchResults?.[0]?.[target]; 

  const isPending = !!(isLoading && source && target && token);

  return (
    <Card
      backgroundColor="primary.light"
      style={{
        alignContent: 'end',
        flexGrow: 1,
      }}
    >
      <CardBody>
        <Label label="You Will Receive" color="textPrimary" dense>
          <Amount
            value={
              !token || receivingAmountRaw === '0'
                ? undefined
                : receivingAmountRaw
            }
            unit={targetToken?.name}
            fallback="0"
            loading={isPending}
          />
        </Label>
        <Divider borderStyle="dashed" style={{ margin: '8px 0' }} />
        <Label label="Transaction Fee" dense>
          <Amount
            value={token ? networkFeeRaw : undefined}
            unit={token?.name}
            fallback="0"
            loading={isPending}
          />
        </Label>
        <Label label="Bridge Fee" dense>
          <Amount
            value={token ? bridgeFeeRaw : undefined}
            unit={token?.name}
            fallback="0"
            loading={isPending}
          />
        </Label>
        <Label label="Min Transfer" dense>
          <Amount
            value={token ? minTransferRaw : undefined}
            fallback="0"
            unit={token?.name}
            loading={isPending}
          />
        </Label>

        {!!error && (
          <Alert severity="error">
            <Truncate lines={1} style={{ whiteSpace: 'nowrap' }}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(error as any)?.message}
            </Truncate>
          </Alert>
        )}
      </CardBody>
    </Card>
  );
};
