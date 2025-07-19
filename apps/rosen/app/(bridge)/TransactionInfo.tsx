'use client';

import {
  Alert,
  Amount2,
  Card,
  Divider,
  Label,
  Tooltip,
  Typography,
} from '@rosen-bridge/ui-kit';

import {
  useTokenMap,
  useTransactionFees,
  useTransactionFormData,
} from '@/_hooks';
import { getTokenNameAndId } from '@/_utils';

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

  const tokenInfo =
    tokenValue && sourceValue && getTokenNameAndId(tokenValue, sourceValue);

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
      sx={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'primary.light',
        padding: (theme) => theme.spacing(3),
        flexGrow: 1,
      }}
    >
      <div style={{ flexGrow: '1' }} />
      <Label label="You Will Receive" color="textPrimary" dense>
        <Amount2
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
        <Amount2
          value={!tokenValue ? undefined : networkFeeRaw}
          unit={tokenInfo?.tokenName}
          loading={isPending}
        />
      </Label>
      <Label label="Bridge Fee" dense>
        <Amount2
          value={!tokenValue ? undefined : bridgeFeeRaw}
          unit={tokenInfo?.tokenName}
          loading={isPending}
        />
      </Label>
      <Label label="Min Transfer" dense>
        <Amount2
          value={!tokenValue ? undefined : minTransferRaw}
          unit={tokenInfo?.tokenName}
          loading={isPending}
        />
      </Label>
      {!!error && (
        <Alert
          severity="error"
          sx={{
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          <Tooltip title={(error as any)?.message}>
            <Typography
              sx={{
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {(error as any)?.message}
            </Typography>
          </Tooltip>
        </Alert>
      )}
    </Card>
  );
};
