'use client';

import { useEffect, useState } from 'react';

import { buildPaymentUri } from '@rosen-network/firo';
import { QrCodeModal, CopyButton, Box, Typography } from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import { QRCodeCanvas } from 'qrcode.react';

import { useNetwork, useTransactionFormData, useTransactionFees } from '@/hooks';
import { firo } from '@/networks';

/**
 * renders an inline QR code and copiable payment URI for Firo
 * only visible when source network is Firo and all form fields are valid
 */
export const FiroPaymentQr = () => {
  const { selectedSource } = useNetwork();
  const { targetValue, amountValue, walletAddressValue } =
    useTransactionFormData();
  const { networkFeeRaw, bridgeFeeRaw } = useTransactionFees();

  const [uri, setUri] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);

  const isFiro = selectedSource?.name === NETWORKS.firo.key;

  useEffect(() => {
    if (!isFiro || !amountValue || !targetValue || !walletAddressValue) {
      setUri('');
      return;
    }
    if (!networkFeeRaw || !bridgeFeeRaw) return;

    firo
      .generateOpReturnData(
        targetValue,
        walletAddressValue,
        networkFeeRaw,
        bridgeFeeRaw,
      )
      .then((opReturnData) => {
        setUri(
          buildPaymentUri(
            firo.lockAddress,
            amountValue as string,
            opReturnData,
          ),
        );
      })
      .catch(() => {
        setUri('');
      });
  }, [isFiro, amountValue, targetValue, walletAddressValue, networkFeeRaw, bridgeFeeRaw]);

  if (!isFiro || !uri) return null;

  return (
    <>
      <Box
        sx={{
          mt: 2,
          p: 2,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          textAlign: 'center',
        }}
      >
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Payment QR
        </Typography>

        <Box
          sx={{
            cursor: 'pointer',
            display: 'inline-block',
            '&:hover': { opacity: 0.8 },
          }}
          onClick={() => setShowQrModal(true)}
        >
          <QRCodeCanvas size={180} value={uri} />
        </Box>

        <Box
          sx={{
            mt: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              wordBreak: 'break-all',
              fontFamily: 'monospace',
            }}
          >
            {uri}
          </Typography>
          <CopyButton size="small" value={uri} />
        </Box>
      </Box>

      <QrCodeModal
        open={showQrModal}
        text={uri}
        handleClose={() => setShowQrModal(false)}
      />
    </>
  );
};
