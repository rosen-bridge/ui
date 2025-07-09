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

import { useBridgeForm, useTokenMap, useTransactionFees } from '@/_hooks';
import { getTokenNameAndId } from '@/_utils';

/**
 * shows fees to the user and handles wallet transaction
 * and wallet connection
 */
export const TransactionInfo = () => {
  const {
    formValues: { source, target, token },
  } = useBridgeForm();

  const tokenMap = useTokenMap();

  const {
    error,
    networkFeeRaw,
    bridgeFeeRaw,
    receivingAmountRaw,
    isLoading: isLoadingFees,
    minTransferRaw,
  } = useTransactionFees();

  const tokenInfo = token && source && getTokenNameAndId(token, source.name);

  const targetTokenSearchResults =
    source &&
    token &&
    token.tokenId &&
    tokenMap.search(source.name, {
      tokenId: token.tokenId,
    });
  const targetTokenInfo =
    (target &&
      targetTokenSearchResults &&
      targetTokenSearchResults[0][target.name]) ||
    undefined;

  const isPending = isLoadingFees && !!source && !!target && !!token;

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
            !token || receivingAmountRaw === '0'
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
          value={!token ? undefined : networkFeeRaw}
          unit={tokenInfo?.tokenName}
          loading={isPending}
        />
      </Label>
      <Label label="Bridge Fee" dense>
        <Amount2
          value={!token ? undefined : bridgeFeeRaw}
          unit={tokenInfo?.tokenName}
          loading={isPending}
        />
      </Label>
      <Label label="Min Transfer" dense>
        <Amount2
          value={!token ? undefined : minTransferRaw}
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
