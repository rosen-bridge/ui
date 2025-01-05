'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import { Alert, styled } from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import { RosenAmountValue } from '@rosen-ui/types';

import { WalletProvider } from '@/_hooks';

import { BridgeForm } from './BridgeForm';
import { BridgeTransaction } from './BridgeTransaction';
import { ConnectOrSubmitButton } from './ConnectOrSubmitButton';

const Background = styled('div')(({ theme }) => ({
  position: 'absolute',
  inset: 0,
  backgroundImage: `url(./background-${theme.palette.mode}.png)`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center center',
  backgroundSize: 'cover',
  zIndex: '0',
  [theme.breakpoints.down('tablet')]: {
    display: 'none',
  },
}));

const BridgeContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  [theme.breakpoints.up('tablet')]: {
    'zIndex': '3',
    'position': 'absolute',
    'top': '50%',
    'left': '50%',
    'transform': 'translate(-50%, -50%)',
    'maxWidth': theme.breakpoints.values.desktop,
    'width': '100%',
    'padding': theme.spacing(4),
    'display': 'grid',
    'gridTemplateColumns': '1fr',
    'gridTemplateRows': 'auto auto auto',
    'alignItems': 'center',
    'justifyContent': 'center',
    'rowGap': theme.spacing(4),
    '& > button': {
      width: '50%',
      justifySelf: 'center',
    },
  },
  [theme.breakpoints.up('laptop')]: {
    gridTemplateColumns: '8fr 4fr',
    alignItems: 'unset',
    justifyContent: 'unset',
  },
}));

export interface BridgeForm {
  source: string | null;
  target: string | null;
  token: string | null;
  walletAddress: string | null;
  amount: RosenAmountValue | null;
}

/**
 * bridge main layout
 */
const RosenBridge = () => {
  const [chooseWalletsModalOpen, setChooseWalletsModalOpen] = useState(false);

  const methods = useForm<BridgeForm>({
    mode: 'onBlur',
    defaultValues: {
      source: '',
      target: '',
      token: '',
      walletAddress: null,
      amount: null,
    },
  });

  return (
    <>
      <Background />
      <FormProvider {...methods}>
        <WalletProvider>
          <BridgeContainer>
            <BridgeForm />
            <BridgeTransaction
              chooseWalletsModalOpen={chooseWalletsModalOpen}
              setChooseWalletsModalOpen={setChooseWalletsModalOpen}
            />
            {/* 
              TODO: Add a condition that activates this alert specifically when MetaMask is selected
              local:ergo/rosen-bridge/ui#486
            */}
            {(methods.getValues().source == NETWORKS.BINANCE ||
              methods.getValues().source == NETWORKS.ETHEREUM) && (
              <Alert
                severity="warning"
                sx={{ gridColumn: '1 / span 2', textAlign: 'justify' }}
              >
                If you are using Ledger, you may need to enable &apos;Blind
                signing&apos; and &apos;Debug data&apos; in the Ledger (Ethereum
                &gt; Settings) due to{' '}
                <a href="https://github.com/LedgerHQ/app-ethereum/issues/311">
                  a known issue in Ledger and MetaMask interaction
                </a>
                .
              </Alert>
            )}
            <ConnectOrSubmitButton
              setChooseWalletsModalOpen={setChooseWalletsModalOpen}
            />
          </BridgeContainer>
        </WalletProvider>
      </FormProvider>
    </>
  );
};

export default RosenBridge;
