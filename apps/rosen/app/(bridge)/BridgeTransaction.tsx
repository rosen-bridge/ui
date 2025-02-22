'use client';

import { Dispatch, SetStateAction } from 'react';

import {
  Alert,
  Amount,
  Card,
  Divider,
  Tooltip,
  Typography,
} from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';

import {
  useNetwork,
  useTokenMap,
  useTransactionFees,
  useTransactionFormData,
  useWallet,
} from '@/_hooks';
import { getTokenNameAndId } from '@/_utils';

import { ChooseWalletModal } from './ChooseWalletModal';
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
    error,
    networkFeeRaw,
    bridgeFeeRaw,
    receivingAmountRaw,
    isLoading: isLoadingFees,
    minTransferRaw,
  } = useTransactionFees();

  const {
    select: setSelectedWallet,
    wallets,
    selected: selectedWallet,
  } = useWallet();

  const { selectedSource } = useNetwork();

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

  const isPending = isLoadingFees && sourceValue && targetValue && tokenValue;

  return (
    <>
      <Card
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          gap: (theme) => theme.spacing(2),
          backgroundColor: 'primary.light',
          padding: (theme) => theme.spacing(3),
        }}
      >
        <WalletInfo
          icon={selectedWallet?.icon}
          label={selectedWallet?.label}
          onClick={() => setChooseWalletsModalOpen(true)}
        />
        {sourceValue == NETWORKS.bitcoin.key && (
          <Alert severity="warning" icon={false}>
            We only support native SegWit addresses (P2WPKH or P2WSH) for the
            source address.
          </Alert>
        )}
        <div style={{ flexGrow: '1' }} />
        <Amount
          title="Transaction Fee"
          value={networkFeeRaw}
          unit={tokenInfo?.tokenName}
          loading={isPending}
        />
        <Amount
          title="Bridge Fee"
          value={bridgeFeeRaw}
          unit={tokenInfo?.tokenName}
          loading={isPending}
        />
        <Amount
          title="Min Transfer"
          value={minTransferRaw}
          unit={tokenInfo?.tokenName}
          loading={isPending}
        />
        <Divider sx={{ borderStyle: 'dashed' }} />
        <Amount
          title="You Will Receive"
          value={receivingAmountRaw}
          unit={targetTokenInfo?.name}
          loading={isPending}
        />
        {!!error && (
          <Alert
            severity="error"
            sx={{
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            <Tooltip title={(error as any)?.message}>
              <Typography
                sx={{
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {(error as any)?.message}
              </Typography>
            </Tooltip>
          </Alert>
        )}
      </Card>
      <ChooseWalletModal
        open={chooseWalletsModalOpen}
        chainName={selectedSource?.name}
        setSelectedWallet={setSelectedWallet}
        handleClose={() => setChooseWalletsModalOpen(false)}
        wallets={wallets || []}
      />
    </>
  );
};
