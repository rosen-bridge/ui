'use client';

import { Dispatch, SetStateAction } from 'react';

import {
  Alert,
  Amount2,
  Card,
  Divider,
  Label,
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
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
            icon={selectedWallet?.iconReact}
            label={selectedWallet?.label}
            disconnect={disconnect}
            onClick={() => setChooseWalletsModalOpen(true)}
          />
        </Card>
        <Card
          sx={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'primary.light',
            padding: (theme) => theme.spacing(3),
            flexGrow: 1,
          }}
        >
          <div style={{ flexGrow: '1' }} />
          <Label label="You Will Receive" color="textPrimary" dense>
            <Amount2
              value={
                !tokenValue || receivingAmountRaw === '0'
                  ? undefined
                  : receivingAmountRaw
              }
              unit={targetTokenInfo?.name}
              loading={isPending}
            />
          </Label>
          <Divider sx={{ borderStyle: 'dashed', my: 1 }} />
          <Label label="Transaction Fee" dense>
            <Amount2
              value={!tokenValue ? undefined : networkFeeRaw}
              unit={tokenInfo?.tokenName}
              loading={isPending}
            />
          </Label>
          <Label label="Bridge Fee" dense>
            <Amount2
              value={!tokenValue ? undefined : bridgeFeeRaw}
              unit={tokenInfo?.tokenName}
              loading={isPending}
            />
          </Label>
          <Label label="Min Transfer" dense>
            <Amount2
              value={!tokenValue ? undefined : minTransferRaw}
              unit={tokenInfo?.tokenName}
              loading={isPending}
            />
          </Label>
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
        selectedWallet={selectedWallet}
        disconnect={disconnect}
        open={chooseWalletsModalOpen}
        chainName={selectedSource?.name}
        setSelectedWallet={setSelectedWallet}
        handleClose={() => setChooseWalletsModalOpen(false)}
        wallets={wallets || []}
      />
    </>
  );
};
