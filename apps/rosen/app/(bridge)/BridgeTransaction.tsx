'use client';

import {
  Alert,
  Card,
  Divider,
  Tooltip,
  Typography,
} from '@rosen-bridge/ui-kit';

import useNetwork from '@/_hooks/useNetwork';
import { useTokenMap } from '@/_hooks/useTokenMap';
import useTransactionFees from '@/_hooks/useTransactionFees';
import useTransactionFormData from '@/_hooks/useTransactionFormData';
import useWallet from '@/_hooks/useWallet';

import { getTokenNameAndId } from '@/_utils';
import { ChooseWalletModal } from './ChooseWalletModal';
import { Dispatch, SetStateAction } from 'react';
import { Fee } from './Fee';
import { WalletInfo } from './WalletInfo';

export interface BridgeTransactionProps {
  chooseWalletsModalOpen: boolean;
  setChooseWalletsModalOpen: Dispatch<SetStateAction<boolean>>;
}

/**
 * shows fees to the user and handles wallet transaction
 * and wallet connection
 */
export const BridgeTransaction = ({
  chooseWalletsModalOpen,
  setChooseWalletsModalOpen,
}: BridgeTransactionProps) => {
  const { sourceValue, targetValue, tokenValue, amountValue } =
    useTransactionFormData();

  const tokenMap = useTokenMap();

  const {
    status,
    networkFeeRaw,
    bridgeFeeRaw,
    receivingAmountRaw,
    isLoading: isLoadingFees,
    minTransferRaw,
  } = useTransactionFees(sourceValue, targetValue, tokenValue, amountValue);
  const { setSelectedWallet, wallets, selectedWallet } = useWallet();

  const { selectedNetwork } = useNetwork();

  const tokenInfo = tokenValue && getTokenNameAndId(tokenValue, sourceValue);

  const idKey = sourceValue && tokenMap.getIdKey(sourceValue);
  const targetTokenSearchResults =
    tokenValue &&
    idKey &&
    tokenMap.search(sourceValue, {
      [idKey]: tokenValue[idKey],
    });
  const targetTokenInfo = targetTokenSearchResults?.[0]?.[targetValue];

  const isPending = isLoadingFees && sourceValue && targetValue && tokenValue;

  return (
    <>
      <Card
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          gap: (theme) => theme.spacing(2),
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.primary.light
              : theme.palette.primary.dark,
          padding: (theme) => theme.spacing(3),
        }}
      >
        <WalletInfo
          icon={selectedWallet?.icon}
          label={selectedWallet?.label}
          onClick={() => setChooseWalletsModalOpen(true)}
        />
        <div style={{ flexGrow: '1' }} />
        <Fee
          title="Transaction Fee"
          amount={networkFeeRaw}
          unit={tokenInfo?.tokenName}
          loading={isPending}
        />
        <Fee
          title="Bridge Fee"
          amount={bridgeFeeRaw}
          unit={tokenInfo?.tokenName}
          loading={isPending}
        />
        <Fee
          title="Min Transfer"
          amount={minTransferRaw}
          unit={tokenInfo?.tokenName}
          loading={isPending}
        />
        <Divider sx={{ borderStyle: 'dashed' }} />
        <Fee
          title="You Will Receive"
          amount={receivingAmountRaw}
          unit={targetTokenInfo?.name}
          loading={isPending}
        />
        {status?.status === 'error' && (
          <Alert
            severity="error"
            sx={{
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            <Tooltip title={status?.message}>
              <Typography
                sx={{
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {status?.message}
              </Typography>
            </Tooltip>
          </Alert>
        )}
      </Card>
      <ChooseWalletModal
        open={chooseWalletsModalOpen}
        chainName={selectedNetwork?.name ?? ''}
        setSelectedWallet={setSelectedWallet}
        handleClose={() => setChooseWalletsModalOpen(false)}
        wallets={wallets || []}
      />
    </>
  );
};
