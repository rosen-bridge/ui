import { useState } from 'react';

import { ArrowRight, CommentAltExclamation } from '@rosen-bridge/icons';
import {
  Box,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  EnhancedDialogTitle,
  Grid,
  LoadingButton,
  SvgIcon,
  Typography,
} from '@rosen-bridge/ui-kit';

import useNetwork from '@/_hooks/useNetwork';
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
    isLoading: isLoadingFees,
  } = useTransactionFees(sourceValue, targetValue, tokenValue, amountValue);

  const { selectedWallet } = useWallet();

  const { startTransaction, isSubmitting: isTransactionSubmitting } =
    useTransaction();

  const handleFormSubmit = handleSubmit(() => {
    startTransaction(bridgeFee, networkFee);
  });

  const { availableNetworks } = useNetwork();

  const source = availableNetworks.find(
    (availableNetwork) => availableNetwork.name == sourceValue,
  );
  const SourceLogo = source?.logo;

  const target = availableNetworks.find(
    (availableNetwork) => availableNetwork.name == targetValue,
  );
  const TargetLogo = target?.logo;

  const tokenInfo =
    tokenValue && sourceValue && getTokenNameAndId(tokenValue, sourceValue);

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
          <Grid container gap={1} alignItems="flex-end" justifyContent="center">
            <Typography variant="h2">{amountValue || 0}</Typography>
            <Typography>{tokenInfo?.tokenName}</Typography>
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
            <Typography variant="body2" color="text.secondary">
              From
            </Typography>
            <div></div>
            <Typography variant="body2" color="text.secondary">
              To
            </Typography>
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
          <Typography variant="body2" color="text.secondary">
            Destination address
          </Typography>
          <Typography sx={{ wordBreak: 'break-all' }}>
            {walletAddressValue}
          </Typography>
          <Box height={(theme) => theme.spacing(1)} />
          <Typography variant="body2" color="text.secondary">
            Transaction fee
          </Typography>
          <Typography>
            {networkFeeRaw} {tokenInfo?.tokenName}
          </Typography>
          <Box height={(theme) => theme.spacing(1)} />
          <Typography variant="body2" color="text.secondary">
            Bridge fee
          </Typography>
          <Typography>
            {bridgeFeeRaw} {tokenInfo?.tokenName}
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
