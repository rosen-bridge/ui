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
  useNetwork,
  useTokenMap,
  useTransaction,
  useTransactionFees,
  useTransactionFormData,
  useWallet,
} from '@/hooks';
import { getTokenNameAndId } from '@/utils';

export const SubmitButton = () => {
  const [open, setOpen] = useState(false);

  const tokenMap = useTokenMap();

  const {
    sourceValue,
    targetValue,
    tokenValue,
    amountValue,
    formState: { isSubmitting: isFormSubmitting, errors, isValidating },
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
  } = useTransactionFees();

  const { selected: selectedWallet } = useWallet();

  const { startTransaction, isSubmitting: isTransactionSubmitting } =
    useTransaction();

  const handleFormSubmit = handleSubmit(() => {
    startTransaction().then(() => setOpen(false));
  });

  const { availableSources } = useNetwork();

  const source = availableSources.find(
    (availableNetwork) => availableNetwork.name == sourceValue,
  );

  const target = availableSources.find(
    (availableNetwork) => availableNetwork.name == targetValue,
  );

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

  const disabled =
    !selectedWallet ||
    !sourceValue ||
    !targetValue ||
    !tokenValue ||
    !amountValue ||
    !walletAddressValue ||
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
                  value={walletAddressValue}
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
