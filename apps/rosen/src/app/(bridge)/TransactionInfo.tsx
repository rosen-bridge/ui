'use client';

import { RosenChainToken } from '@rosen-bridge/tokens';
import {
  Alert,
  Amount,
  Card,
  CardBody,
  DividerNew,
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
  const { sourceValue, targetValue, tokenValue, amountValue } =
    useTransactionFormData();

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
            value={
              !tokenValue || receivingAmountRaw === '0'
                ? undefined
                : receivingAmountRaw
            }
            unit={targetTokenInfo?.name}
            loading={isPending}
          />
        </Label>
        <DividerNew
          style={{
            borderStyle: 'dashed',
            marginBottom: '8px',
            marginTop: '8px',
          }}
        />
        <Label label="Transaction Fee" dense>
          <Amount
            value={networkFeeRaw}
            unit={tokenInfo?.name}
            loading={isPending}
          />
        </Label>
        <Label label="Bridge Fee" dense>
          <Amount
            value={bridgeFeeRaw}
            unit={tokenInfo?.name}
            loading={isPending}
          />
        </Label>
        <Label label="Min Transfer" dense>
          <Amount
            value={minTransferRaw}
            unit={tokenInfo?.name}
            loading={isPending}
          />
        </Label>

        {!!error && (
          <Alert severity="error">
            <Truncate lines={1} style={{ whiteSpace: 'nowrap' }}>
              {(error as any)?.message}
            </Truncate>
          </Alert>
        )}
      </CardBody>
    </Card>
  );
};
