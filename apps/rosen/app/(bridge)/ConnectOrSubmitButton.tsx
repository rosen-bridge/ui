import { useState } from 'react';

import { ArrowRight, CommentAltExclamation } from '@rosen-bridge/icons';
import {
  Amount,
  Box,
  Card,
  Dialog,
  DialogActions,
  Divider,
  EnhancedDialogTitle,
  Grid,
  LoadingButton,
  SvgIcon,
  Typography,
} from '@rosen-bridge/ui-kit';

import { useNetwork } from '@/_hooks/useNetwork';
import { useTokenMap } from '@/_hooks/useTokenMap';
import { useTransaction } from '@/_hooks/useTransaction';
import useTransactionFees from '@/_hooks/useTransactionFees';
import useTransactionFormData from '@/_hooks/useTransactionFormData';
import useWallet from '@/_hooks/useWallet';
import { getTokenNameAndId } from '@/_utils';

interface ConnectOrSubmitButtonProps {
  setChooseWalletsModalOpen: (open: boolean) => void;
}

export const ConnectOrSubmitButton = ({
  setChooseWalletsModalOpen,
}: ConnectOrSubmitButtonProps) => {
  const [open, setOpen] = useState(false);

  const tokenMap = useTokenMap();

  const {
    sourceValue,
    targetValue,
    tokenValue,
    amountValue,
    formState: { isSubmitting: isFormSubmitting, errors },
    walletAddressValue,
    handleSubmit,
  } = useTransactionFormData();

  const {
    networkFee,
    networkFeeRaw,
    bridgeFee,
    bridgeFeeRaw,
    receivingAmountRaw,
    isLoading: isLoadingFees,
  } = useTransactionFees(sourceValue, targetValue, tokenValue, amountValue);

  const { selectedWallet } = useWallet();

  const { startTransaction, isSubmitting: isTransactionSubmitting } =
    useTransaction();

  const handleFormSubmit = handleSubmit(() => {
    startTransaction(bridgeFee, networkFee);
  });

  const { availableSources } = useNetwork();

  const source = availableSources.find(
    (availableNetwork) => availableNetwork.name == sourceValue,
  );
  const SourceLogo = source?.logo;

  const target = availableSources.find(
    (availableNetwork) => availableNetwork.name == targetValue,
  );
  const TargetLogo = target?.logo;

  const tokenInfo =
    tokenValue && sourceValue && getTokenNameAndId(tokenValue, sourceValue);

  const idKey = sourceValue && tokenMap.getIdKey(sourceValue);
  const targetTokenSearchResults =
    tokenValue &&
    idKey &&
    tokenMap.search(sourceValue, {
      [idKey]: tokenValue[idKey],
    });
  const targetTokenInfo =
    targetValue && targetTokenSearchResults?.[0]?.[targetValue];

  return (
    <>
      <LoadingButton
        sx={{ width: '100%' }}
        color={selectedWallet ? 'success' : 'primary'}
        variant="contained"
        loading={isFormSubmitting || isTransactionSubmitting || isLoadingFees}
        type="submit"
        disabled={!sourceValue}
        onClick={() => {
          if (!selectedWallet) {
            setChooseWalletsModalOpen(true);
          } else if (
            sourceValue &&
            targetValue &&
            tokenValue &&
            amountValue &&
            walletAddressValue &&
            bridgeFee &&
            networkFee &&
            !errors.amount &&
            !errors.walletAddress
          ) {
            setOpen(true);
          }
        }}
      >
        {!selectedWallet ? 'CONNECT WALLET' : 'SUBMIT'}
      </LoadingButton>
      <Dialog open={open} maxWidth="tablet" onClose={() => setOpen(false)}>
        <EnhancedDialogTitle
          icon={<CommentAltExclamation />}
          onClose={() => setOpen(false)}
        >
          Confirm Transaction
        </EnhancedDialogTitle>
        <Card
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.primary.light
                : theme.palette.primary.dark,
            px: 2,
            py: 3,
            mx: 3,
          }}
        >
          <Grid container justifyContent="center">
            <Amount
              value={amountValue || 0}
              size="large"
              unit={tokenInfo?.tokenName}
            />
          </Grid>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'auto auto auto',
              justifyContent: 'center',
              columnGap: 2,
              rowGap: 0.5,
              my: 3,
            }}
          >
            <Grid container alignItems="center" gap={1}>
              {SourceLogo && (
                <SvgIcon>
                  <SourceLogo />
                </SvgIcon>
              )}
              <Typography color="text.primary">{source?.label}</Typography>
            </Grid>
            <SvgIcon>
              <ArrowRight />
            </SvgIcon>
            <Grid container alignItems="center" gap={1}>
              {TargetLogo && (
                <SvgIcon>
                  <TargetLogo />
                </SvgIcon>
              )}
              <Typography color="text.primary">{target?.label}</Typography>
            </Grid>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Amount
            title="Transaction Fee"
            value={networkFeeRaw}
            unit={tokenInfo?.tokenName}
          />
          <Box sx={{ my: 2 }} />
          <Amount
            title="Bridge Fee"
            value={bridgeFeeRaw}
            unit={tokenInfo?.tokenName}
          />
          <Box sx={{ my: 2 }} />
          <Amount
            title="Received amount"
            value={receivingAmountRaw}
            unit={targetTokenInfo?.name}
          />
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Destination address
          </Typography>
          <Typography sx={{ wordBreak: 'break-all' }}>
            {walletAddressValue}
          </Typography>
        </Card>
        <DialogActions>
          <LoadingButton
            color="secondary"
            variant="contained"
            sx={{ flexGrow: 2 }}
            onClick={() => setOpen(false)}
          >
            Cancel
          </LoadingButton>
          <LoadingButton
            variant="contained"
            sx={{ flexGrow: 5 }}
            loading={
              isFormSubmitting || isTransactionSubmitting || isLoadingFees
            }
            onClick={handleFormSubmit}
          >
            Confirm
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};
