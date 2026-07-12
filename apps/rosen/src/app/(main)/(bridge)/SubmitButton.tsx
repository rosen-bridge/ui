import { useState } from 'react';

import type { RosenChainToken } from '@rosen-bridge/tokens';
import {
  Alert,
  Amount,
  Button,
  Card,
  CardBody,
  Center,
  Connector,
  DialogContentText,
  Divider,
  EnhancedDialog,
  EnhancedDialogActions,
  EnhancedDialogContent,
  EnhancedDialogTitle,
  Identifier,
  Label,
  Network,
  QRCodeCanvas,
  Stack,
  Typography,
  useIsDarkMode,
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

  const [qrCode, setQrCode] = useState('');

  const tokenMap = useTokenMap();

  const isDarkMode = useIsDarkMode();

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

  const close = () => {
    setOpen(false);
    setTimeout(() => setQrCode(''), 500);
  };

  const handleFormSubmit = handleSubmit(() => {
    startTransaction().then((result) => {
      /**
       * TODO: Improve transfer Output Types for QR Code mode
       * local:ergo/rosen-bridge/ui#1191
       */
      const isQrCode = !!result?.startsWith('qrcode:');
      if (result && isQrCode) {
        setQrCode(result.replace('qrcode:', ''));
      } else {
        close();
      }
    });
  });

  const { availableSources } = useNetwork();

  const source = availableSources.find(
    (availableNetwork) => availableNetwork.name === sourceValue,
  );

  const target = availableSources.find(
    (availableNetwork) => availableNetwork.name === targetValue,
  );

  const tokenInfo = tokenValue as RosenChainToken;

  const targetTokenSearchResults =
    sourceValue &&
    tokenValue?.tokenId &&
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
      <Button
        style={{ width: '100%' }}
        variant="contained"
        loading={isFormSubmitting || isTransactionSubmitting || isLoadingFees}
        type="submit"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        SUBMIT
      </Button>
      <EnhancedDialog
        open={open}
        maxWidth="tablet"
        stickOn="mobile"
        onClose={() => close()}
      >
        {qrCode ? (
          <>
            <EnhancedDialogTitle icon="QrcodeScan" onClose={() => close()}>
              Scan QR Code
            </EnhancedDialogTitle>
            <EnhancedDialogContent>
              <Stack spacing={2}>
                <DialogContentText>
                  Scan this QR code or copy the transaction data below and
                  submit it using a compatible wallet or application.
                </DialogContentText>
                <Center>
                  <QRCodeCanvas
                    bgColor="transparent"
                    fgColor={isDarkMode ? '#fff' : '#000'}
                    value={qrCode}
                    style={{ margin: '16px 0' }}
                  />
                </Center>
                <Alert severity="warning">
                  This transaction data is time-sensitive. If too much time
                  passes before submission, network or bridge fees may change
                  and the transaction may fail.
                </Alert>
              </Stack>
            </EnhancedDialogContent>
            <EnhancedDialogActions>
              <Button
                color="secondary"
                variant="contained"
                style={{ flexGrow: 2 }}
                onClick={() => close()}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                style={{ flexGrow: 5 }}
                onClick={() => {
                  navigator.clipboard.writeText(qrCode);
                }}
              >
                Copy
              </Button>
            </EnhancedDialogActions>
          </>
        ) : (
          <>
            <EnhancedDialogTitle
              icon="CommentAltExclamation"
              onClose={() => close()}
            >
              Confirm Transaction
            </EnhancedDialogTitle>
            <EnhancedDialogContent
              style={{
                paddingTop: 0,
                paddingBottom: 0,
              }}
            >
              <Card backgroundColor="primary-light">
                <CardBody>
                  <Stack spacing={2}>
                    <Stack align="center" spacing={2}>
                      <Typography variant="subtitle1">
                        <Amount
                          value={amountValue || 0}
                          unit={tokenInfo?.name}
                        />
                      </Typography>
                      {source && target && (
                        <Connector
                          start={<Network value={source.name} />}
                          end={<Network value={target.name} />}
                        />
                      )}
                    </Stack>
                    <Divider />
                    <div>
                      <Label label="Transaction Fee">
                        <Amount value={networkFeeRaw} unit={tokenInfo?.name} />
                      </Label>
                      <Label label="Bridge Fee">
                        <Amount value={bridgeFeeRaw} unit={tokenInfo?.name} />
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
                      <Identifier value={walletAddressValue} copyable />
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
                onClick={() => close()}
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
          </>
        )}
      </EnhancedDialog>
    </>
  );
};
