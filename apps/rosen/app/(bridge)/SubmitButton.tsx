import { useState } from 'react';

import { CommentAltExclamation } from '@rosen-bridge/icons';
import {
  Amount,
  Amount2,
  Card,
  Connector,
  Divider,
  EnhancedDialog,
  EnhancedDialogActions,
  EnhancedDialogContent,
  EnhancedDialogTitle,
  Identifier,
  Label,
  LoadingButton,
  Network,
  Stack,
} from '@rosen-bridge/ui-kit';

import {
  useBridgeForm,
  useTokenMap,
  useTransaction,
  useTransactionFees,
  useTransactionFormData,
  useWallet,
} from '@/_hooks';
import { getTokenNameAndId } from '@/_utils';

export const SubmitButton = () => {
  const [open, setOpen] = useState(false);

  const tokenMap = useTokenMap();

  const {
    formValues: { source, target, token, walletAddress },
    formState: { isSubmitting: isFormSubmitting, errors, isValidating },
  } = useBridgeForm();
  const { amountValue, handleSubmit } = useTransactionFormData();

  const {
    networkFee,
    networkFeeRaw,
    bridgeFee,
    bridgeFeeRaw,
    receivingAmountRaw,
    isLoading: isLoadingFees,
  } = useTransactionFees();

  const { selected: selectedWallet } = useWallet();

  const { startTransaction, isSubmitting: isTransactionSubmitting } =
    useTransaction();

  const handleFormSubmit = handleSubmit(() => {
    startTransaction().then(() => setOpen(false));
  });

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

  const disabled =
    !selectedWallet ||
    !source ||
    !target ||
    !token ||
    !amountValue ||
    !walletAddress ||
    !bridgeFee ||
    !networkFee ||
    !!errors.amount ||
    !!errors.walletAddress ||
    isValidating;
  return (
    <>
      <LoadingButton
        sx={{ width: '100%' }}
        variant="contained"
        loading={isFormSubmitting || isTransactionSubmitting || isLoadingFees}
        type="submit"
        disabled={disabled}
        onClick={() => {
          setOpen(true);
        }}
      >
        SUBMIT
      </LoadingButton>
      <EnhancedDialog
        open={open}
        maxWidth="tablet"
        stickOn="mobile"
        onClose={() => setOpen(false)}
      >
        <EnhancedDialogTitle
          icon={<CommentAltExclamation />}
          onClose={() => setOpen(false)}
        >
          Confirm Transaction
        </EnhancedDialogTitle>
        <EnhancedDialogContent
          style={{
            paddingTop: 0,
            paddingBottom: 0,
          }}
        >
          <Card
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === 'light'
                  ? theme.palette.primary.light
                  : theme.palette.primary.dark,
              px: 2,
              py: 3,
            }}
          >
            <Stack spacing={2}>
              <Stack alignItems="center" spacing={2}>
                <Amount
                  value={amountValue || 0}
                  size="large"
                  unit={tokenInfo?.tokenName}
                />
                {source && target && (
                  <Connector
                    start={<Network name={source.name} />}
                    end={<Network name={target.name} />}
                  />
                )}
              </Stack>
              <Divider />
              <div>
                <Label label="Transaction Fee">
                  <Amount2 value={networkFeeRaw} unit={tokenInfo?.tokenName} />
                </Label>
                <Label label="Bridge Fee">
                  <Amount2 value={bridgeFeeRaw} unit={tokenInfo?.tokenName} />
                </Label>
                <Label label="Received amount">
                  <Amount2
                    value={receivingAmountRaw}
                    unit={targetTokenInfo?.name}
                  />
                </Label>
              </div>
              <Divider />
              <Label label="Destination Address" orientation="vertical">
                <Identifier
                  value={walletAddress || ''}
                  copyable
                  title="Destination address"
                />
              </Label>
            </Stack>
          </Card>
        </EnhancedDialogContent>
        <EnhancedDialogActions>
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
        </EnhancedDialogActions>
      </EnhancedDialog>
    </>
  );
};
