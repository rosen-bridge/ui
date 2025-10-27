'use client';

import { RosenChainToken } from '@rosen-bridge/tokens';
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
  useTokenMap,
  useTransactionFees,
  useTransactionFormData,
} from '@/hooks';

/**
 * shows fees to the user and handles wallet transaction
 * and wallet connection
 */
export const TransactionInfo = () => {
  const { sourceValue, targetValue, tokenValue } = useTransactionFormData();

  const tokenMap = useTokenMap();

  const {
    error,
    networkFeeRaw,
    bridgeFeeRaw,
    receivingAmountRaw,
    isLoading: isLoadingFees,
    minTransferRaw,
  } = useTransactionFees();

  const tokenInfo = tokenValue as RosenChainToken;

  const targetTokenSearchResults =
    sourceValue &&
    tokenValue &&
    tokenValue.tokenId &&
    tokenMap.search(sourceValue, {
      tokenId: tokenValue.tokenId,
    });
  const targetTokenInfo =
    targetValue && targetTokenSearchResults?.[0]?.[targetValue];

  const isPending = isLoadingFees && sourceValue && targetValue && tokenValue;

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
            data-test-id="rosen-you-will-receive-amount"
            value={
              !tokenValue || receivingAmountRaw === '0'
                ? undefined
                : receivingAmountRaw
            }
            unit={targetTokenInfo?.name}
            loading={isPending}
          />
        </Label>
        <Divider borderStyle="dashed" style={{ margin: '8px 0' }} />
        <Label label="Transaction Fee" dense>
          <Amount
            data-test-id="rosen-transaction-fee-amount"
            value={!tokenValue ? undefined : networkFeeRaw}
            unit={tokenInfo?.name}
            loading={isPending}
          />
        </Label>
        <Label label="Bridge Fee" dense>
          <Amount
            data-test-id="rosen-bridge-fee-amount"
            value={!tokenValue ? undefined : bridgeFeeRaw}
            unit={tokenInfo?.name}
            loading={isPending}
          />
        </Label>
        <Label label="Min Transfer" dense>
          <Amount
            data-test-id="rosen-min-transfer-amount"
            value={!tokenValue ? undefined : minTransferRaw}
            unit={tokenInfo?.name}
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
