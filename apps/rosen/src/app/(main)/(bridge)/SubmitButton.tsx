import { type ChangeEvent, useState } from 'react';

import type { RosenChainToken } from '@rosen-bridge/tokens';
import { NETWORKS } from '@rosen-ui/constants';
import {
  Alert,
  Amount,
  Button,
  Card,
  CardBody,
  Center,
  Connector,
  Dialog,
  DialogBody,
  DialogCloseButton,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogIcon,
  DialogTitle,
  Divider,
  Identifier,
  Label,
  Network,
  QRCodeCanvas,
  Stack,
  Typography,
  useIsDarkMode,
  useToast,
} from '@rosen-bridge/ui-kit';

import {
  useNetwork,
  useTokenMap,
  useTransaction,
  useTransactionFees,
  useTransactionFormData,
  useWallet,
} from '@/hooks';
import { zcash } from '@/networks/zcash/client';
import { verifyZcashLockReceipt } from '@/networks/zcash/verifyReceipt';

export const SubmitButton = () => {
  const [open, setOpen] = useState(false);

  const [qrCode, setQrCode] = useState('');

  const [zcashIntentJson, setZcashIntentJson] = useState('');

  const [zcashReceiptJson, setZcashReceiptJson] = useState('');

  const [zcashResumeJson, setZcashResumeJson] = useState('');

  const [zcashResumeMode, setZcashResumeMode] = useState(false);

  const [zcashIntentFromResume, setZcashIntentFromResume] = useState(false);

  const [isCheckingReceipt, setIsCheckingReceipt] = useState(false);

  const toast = useToast();

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

  const { startTransaction, isSubmitting: isTransactionSubmitting } = useTransaction();

  const close = () => {
    setOpen(false);
    setZcashResumeMode(false);
    setTimeout(() => setQrCode(''), 500);
  };

  const handleFormSubmit = handleSubmit(() => {
    startTransaction().then((result) => {
      /**
       * TODO: Improve transfer Output Types for QR Code mode
       * local:ergo/rosen-bridge/ui#1191
       */
      const isQrCode = !!result?.startsWith('qrcode:');
      const isFileIntent = !!result?.startsWith('file-intent:');
      if (result && isFileIntent) {
        setZcashIntentJson(result.slice('file-intent:'.length));
        setZcashIntentFromResume(false);
      } else if (result && isQrCode) {
        setQrCode(result.replace('qrcode:', ''));
      } else {
        close();
      }
    });
  });

  const downloadZcashIntent = () => {
    if (!zcashIntentJson || zcashIntentFromResume) return;
    const intent = JSON.parse(zcashIntentJson) as { requestId: string };
    const blob = new Blob([zcashIntentJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `rosen-zcash-lock-${intent.requestId}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const verifyZcashReceipt = async (receiptJson: string) => {
    if (!zcashIntentJson) return;
    setIsCheckingReceipt(true);
    try {
      const { txid, confirmations } = await verifyZcashLockReceipt(
        zcashIntentJson,
        receiptJson,
      );
      toast.add({
        type: 'success',
        description: `Zcash lock ${txid} verified on-chain with ${confirmations} confirmation(s).`,
      });
      setZcashIntentJson('');
      setZcashReceiptJson('');
      close();
    } catch (error) {
      toast.add({
        type: 'error',
        description: error instanceof Error ? error.message : 'Zcash receipt verification failed',
      });
    } finally {
      setIsCheckingReceipt(false);
    }
  };

  const importZcashReceipt = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > 4_096) {
      toast.add({ type: 'error', description: 'Zcash receipt is too large' });
      return;
    }
    await verifyZcashReceipt(await file.text());
  };

  const { availableSources } = useNetwork();

  const source = availableSources.find((availableNetwork) => availableNetwork.name === sourceValue);

  const target = availableSources.find((availableNetwork) => availableNetwork.name === targetValue);

  const tokenInfo = tokenValue as RosenChainToken;

  const targetTokenSearchResults =
    sourceValue &&
    tokenValue?.tokenId &&
    tokenMap.search(sourceValue, {
      tokenId: tokenValue.tokenId,
    });
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
        onClick={() => setOpen(true)}
      >
        SUBMIT
      </Button>
      {sourceValue === NETWORKS.zcash.key && zcash.isConfigured() && (
        <Button
          color="secondary"
          variant="contained"
          onClick={() => {
            setZcashResumeMode(true);
            setOpen(true);
          }}
        >
          Verify saved Zcash deposit
        </Button>
      )}
      <Dialog open={open} unstick="tablet" width="small" onClose={() => close()}>
        {zcashIntentJson && !zcashResumeMode ? (
          <>
            <DialogHeader>
              <DialogIcon name="FileAlt" />
              <DialogTitle>Complete Zcash deposit with Zallet</DialogTitle>
              <DialogCloseButton />
            </DialogHeader>
            <DialogBody>
              <Stack spacing={2}>
                <DialogDescription>
                  Download the lock request and open it with the local Rosen Zallet companion.
                  Review the reserve, amount, Ergo destination, and network fee before approving
                  the transaction in Zallet. Import its receipt after the deposit confirms.
                </DialogDescription>
                <Alert severity="warning">
                  This deposit uses transparent Zcash transactions. Addresses and amounts are
                  visible on Zcash. The local companion shares your transparent address and
                  confirmed spendable ZEC with this page, but keeps wallet keys and RPC
                  credentials local; review and sign in the local companion.
                </Alert>
                {!zcashIntentFromResume && (
                  <Button variant="contained" onClick={downloadZcashIntent}>
                    Download lock request
                  </Button>
                )}
                <label htmlFor="zcash-lock-receipt">Import confirmed receipt</label>
                <input
                  id="zcash-lock-receipt"
                  type="file"
                  accept="application/json,.json"
                  disabled={isCheckingReceipt}
                  onChange={importZcashReceipt}
                />
                <textarea
                  aria-label="Zcash receipt JSON"
                  placeholder="Or paste the companion receipt JSON"
                  rows={4}
                  maxLength={4_096}
                  value={zcashReceiptJson}
                  onChange={(event) => setZcashReceiptJson(event.target.value)}
                />
                <Button
                  variant="contained"
                  disabled={!zcashReceiptJson || isCheckingReceipt}
                  onClick={() => verifyZcashReceipt(zcashReceiptJson)}
                >
                  Verify pasted receipt
                </Button>
                {isCheckingReceipt && <Typography>Checking Zcash chain confirmation…</Typography>}
              </Stack>
            </DialogBody>
            <DialogFooter>
              <Button color="secondary" variant="contained" onClick={close}>
                Close
              </Button>
            </DialogFooter>
          </>
        ) : zcashResumeMode ? (
          <>
            <DialogHeader>
              <DialogIcon name="FileAlt" />
              <DialogTitle>Verify saved Zcash deposit</DialogTitle>
              <DialogCloseButton />
            </DialogHeader>
            <DialogBody>
              <Stack spacing={2}>
                <DialogDescription>
                  Paste the exact lock request JSON you saved before submitting the deposit.
                </DialogDescription>
                <textarea
                  aria-label="Saved Zcash lock request JSON"
                  rows={5}
                  maxLength={16_384}
                  value={zcashResumeJson}
                  onChange={(event) => setZcashResumeJson(event.target.value)}
                />
                <Button
                  variant="contained"
                  disabled={!zcashResumeJson}
                  onClick={() => {
                    setZcashIntentJson(zcashResumeJson);
                    setZcashIntentFromResume(true);
                    setZcashResumeMode(false);
                  }}
                >
                  Continue to receipt verification
                </Button>
              </Stack>
            </DialogBody>
            <DialogFooter>
              <Button color="secondary" variant="contained" onClick={close}>
                Close
              </Button>
            </DialogFooter>
          </>
        ) : qrCode ? (
          <>
            <DialogHeader>
              <DialogIcon name="QrcodeScan" />
              <DialogTitle>Scan QR Code</DialogTitle>
              <DialogCloseButton />
            </DialogHeader>
            <DialogBody>
              <Stack spacing={2}>
                <DialogDescription>
                  Scan this QR code or copy the transaction data below and submit it using a
                  compatible wallet or application.
                </DialogDescription>
                <Center>
                  <QRCodeCanvas
                    bgColor="transparent"
                    fgColor={isDarkMode ? '#fff' : '#000'}
                    value={qrCode}
                    style={{ margin: '16px 0' }}
                  />
                </Center>
                <Alert severity="warning">
                  This transaction data is time-sensitive. If too much time passes before
                  submission, network or bridge fees may change and the transaction may fail.
                </Alert>
              </Stack>
            </DialogBody>
            <DialogFooter>
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
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogIcon name="CommentAltExclamation" />
              <DialogTitle>Confirm Transaction</DialogTitle>
              <DialogCloseButton />
            </DialogHeader>
            <DialogBody
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
                        <Amount value={amountValue || 0} unit={tokenInfo?.name} />
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
                        <Amount value={receivingAmountRaw} unit={targetTokenInfo?.name} />
                      </Label>
                    </div>
                    <Divider />
                    <Label label="Destination Address" orientation="vertical">
                      <Identifier value={walletAddressValue} copyable />
                    </Label>
                  </Stack>
                </CardBody>
              </Card>
            </DialogBody>
            <DialogFooter>
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
                loading={isFormSubmitting || isTransactionSubmitting || isLoadingFees}
                onClick={handleFormSubmit}
              >
                Confirm
              </Button>
            </DialogFooter>
          </>
        )}
      </Dialog>
    </>
  );
};
