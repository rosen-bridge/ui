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
    disconnect,
  } = useWallet();

  const { selectedSource } = useNetwork();

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

  const isPending = isLoadingFees && sourceValue && targetValue && tokenValue;

  return (
    <>
      <div>
        <Card
          sx={{
            marginBottom: '18px',
            display: 'flex',
            padding: '12px 25px',
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.secondary.light
                : theme.palette.background.paper,
          }}
        >
          <WalletInfo
            icon={selectedWallet?.icon}
            label={selectedWallet?.label}
            disconnect={disconnect}
            onClick={() => setChooseWalletsModalOpen(true)}
          />
        </Card>
        <Card
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '75%',
            gap: (theme) => theme.spacing(1),
            backgroundColor: 'primary.light',
            padding: (theme) => theme.spacing(3),
          }}
        >
          <div style={{ flexGrow: '1' }} />
          <Amount
            title="Transaction Fee"
            value={!tokenValue ? undefined : networkFeeRaw}
            unit={tokenInfo?.tokenName}
            loading={isPending}
          />
          <Amount
            title="Bridge Fee"
            value={!tokenValue ? undefined : bridgeFeeRaw}
            unit={tokenInfo?.tokenName}
            loading={isPending}
          />
          <Amount
            title="Min Transfer"
            value={!tokenValue ? undefined : minTransferRaw}
            unit={tokenInfo?.tokenName}
            loading={isPending}
          />
          <Divider sx={{ borderStyle: 'dashed' }} />
          <Amount
            title="You Will Receive"
            value={
              !tokenValue || receivingAmountRaw === '0'
                ? undefined
                : receivingAmountRaw
            }
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
      </div>
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
