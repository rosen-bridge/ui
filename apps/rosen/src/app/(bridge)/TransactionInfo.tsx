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
            value={
              !tokenValue || receivingAmountRaw === '0'
                ? undefined
                : receivingAmountRaw
            }
            unit={targetTokenInfo?.name}
            loading={isPending}
          />
        </Label>
        <Divider sx={{ borderStyle: 'dashed', my: 1 }} />
        <Label label="Transaction Fee" dense>
          <Amount
            value={!tokenValue ? undefined : networkFeeRaw}
            unit={tokenInfo?.name}
            loading={isPending}
          />
        </Label>
        <Label label="Bridge Fee" dense>
          <Amount
            value={!tokenValue ? undefined : bridgeFeeRaw}
            unit={tokenInfo?.name}
            loading={isPending}
          />
        </Label>
        <Label label="Min Transfer" dense>
          <Amount
            value={!tokenValue ? undefined : minTransferRaw}
            unit={tokenInfo?.name}
            loading={isPending}
          />
        </Label>

        {!!error && (
          <Alert severity="error">
            <Truncate lines={1} style={{ whiteSpace: 'nowrap' }}>
              {/* eslint-disable-next-line */}
              {(error as any)?.message}
            </Truncate>
          </Alert>
        )}
      </CardBody>
    </Card>
  );
};
