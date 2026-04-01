import { useState } from 'react';

import { CommentAltExclamation } from '@rosen-bridge/icons';
import {
  Amount,
  Card,
  CardBody,
  Connector,
  Divider,
  EnhancedDialog,
  EnhancedDialogActions,
  EnhancedDialogContent,
  EnhancedDialogTitle,
  Identifier,
  Label,
  Button,
  Network,
  Stack,
  Typography,
} from '@rosen-bridge/ui-kit';

import {
  useBridgeForm,
  useBridgeFormValues,
  useNetwork,
  useTokenMap,
  useTransaction,
  useTransactionFees,
  useWallet,
} from '@/hooks';

export const SubmitButton = () => {
  const [open, setOpen] = useState(false);

  const tokenMap = useTokenMap();

  const {   
    formState: { isSubmitting: isFormSubmitting, errors, isValidating },
    handleSubmit,
  } = useBridgeForm();

  const {
    source: sourceValue,
    target: targetValue,
    token: tokenValue,
    amount: amountValue,
    walletAddress: walletAddressValue,
  } = useBridgeFormValues();

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

  const targetTokenSearchResults = sourceValue && tokenValue?.tokenId
    ? tokenMap.search(sourceValue, { tokenId: tokenValue.tokenId })
    : undefined;

  const targetTokenInfo = targetValue && targetTokenSearchResults?.[0]?.[targetValue]; 

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
      <Button
        style={{ width: '100%' }}
        variant="contained"
        loading={isFormSubmitting || isTransactionSubmitting || isLoadingFees}
        type="submit"
        disabled={disabled}
        onClick={() => {
          setOpen(true);
        }}
      >
        SUBMIT
      </Button>
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
          <Card backgroundColor="primary.light">
            <CardBody>
              <Stack spacing={2}>
                <Stack align="center" spacing={2}>
                  <Typography variant="subtitle1">
                    <Amount value={amountValue || 0} unit={tokenValue?.name} />
                  </Typography>
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
                    <Amount value={networkFeeRaw} unit={tokenValue?.name} />
                  </Label>
                  <Label label="Bridge Fee">
                    <Amount value={bridgeFeeRaw} unit={tokenValue?.name} />
                  </Label>
                  <Label label="Receiving Amount">
                    <Amount
                      value={receivingAmountRaw}
                      unit={targetTokenInfo?.name}
                    />
                  </Label>
                </div>
                <Divider />
                <Label label="Destination Address" orientation="vertical">
                  <Identifier value={walletAddressValue || undefined} copyable />
                </Label>
              </Stack>
            </CardBody>
          </Card>
        </EnhancedDialogContent>
        <EnhancedDialogActions>
          <Button
            color="secondary"
            variant="contained"
            style={{ flexGrow: 2 }}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            style={{ flexGrow: 5 }}
            loading={
              isFormSubmitting || isTransactionSubmitting || isLoadingFees
            }
            onClick={handleFormSubmit}
          >
            Confirm
          </Button>
        </EnhancedDialogActions>
      </EnhancedDialog>
    </>
  );
};
