import { useState } from 'react';

import { CommentAltExclamation } from '@rosen-bridge/icons';
import { RosenChainToken } from '@rosen-bridge/tokens';
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
  LoadingButton,
  Network,
  Stack,
  Typography,
} from '@rosen-bridge/ui-kit';

import {
  useNetwork,
  useTokenMap,
  useTransaction,
  useTransactionFees,
  useTransactionFormData,
  useWallet,
} from '@/hooks';

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
        data-test-id="rosen-submit-button"
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
        data-test-id="rosen-close-dialog-mobile"
        open={open}
        maxWidth="tablet"
        stickOn="mobile"
        onClose={() => setOpen(false)}
      >
        <EnhancedDialogTitle
          data-test-id="rosen-close-dialog-tablet"
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
                    <Amount value={amountValue || 0} unit={tokenInfo?.name} />
                  </Typography>
                  {source && target && (
                    <Connector
                      start={
                        <Network
                          data-test-id="rosen-source-network-dialog"
                          name={source.name}
                        />
                      }
                      end={
                        <Network
                          data-test-id="rosen-terget-network-dialog"
                          name={target.name}
                        />
                      }
                    />
                  )}
                </Stack>
                <Divider />
                <div>
                  <Label label="Transaction Fee">
                    <Amount
                      data-test-id="rosen-transaction-fee-dialog"
                      value={networkFeeRaw}
                      unit={tokenInfo?.name}
                    />
                  </Label>
                  <Label label="Bridge Fee">
                    <Amount
                      data-test-id="rosen-bridge-fee-dialog"
                      value={bridgeFeeRaw}
                      unit={tokenInfo?.name}
                    />
                  </Label>
                  <Label label="Received amount">
                    <Amount
                      data-test-id="rosen-received-amount-dialog"
                      value={receivingAmountRaw}
                      unit={targetTokenInfo?.name}
                    />
                  </Label>
                </div>
                <Divider />
                <Label label="Destination Address" orientation="vertical">
                  <Identifier
                    data-test-id="rosen-destination-address-dialog"
                    value={walletAddressValue}
                    copyable
                  />
                </Label>
              </Stack>
            </CardBody>
          </Card>
        </EnhancedDialogContent>
        <EnhancedDialogActions>
          <LoadingButton
            data-test-id="rosen-cancel-button-dialog"
            color="secondary"
            variant="contained"
            sx={{ flexGrow: 2 }}
            onClick={() => setOpen(false)}
          >
            Cancel
          </LoadingButton>
          <LoadingButton
            data-test-id="rosen-confirm-button-dialog"
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
