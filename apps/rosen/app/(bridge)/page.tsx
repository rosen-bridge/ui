'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import { Alert, Box, styled } from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import { RosenAmountValue } from '@rosen-ui/types';

import {
  BalanceProvider,
  MaxTransferProvider,
  NetworkProvider,
  TransactionFeesProvider,
  WalletProvider,
} from '@/_hooks';

import { BridgeForm } from './BridgeForm';
import { BridgeTransaction } from './BridgeTransaction';
import { ConnectOrSubmitButton } from './ConnectOrSubmitButton';
import { CubeNetSvg } from './cube-net';

const Background = styled('div')(({ theme }) => ({
  'position': 'absolute',
  'inset': 0,
  'backgroundImage':
    theme.palette.mode === 'light'
      ? `linear-gradient(180deg,${theme.palette.primary.light},${theme.palette.background.default},${theme.palette.background.default},${theme.palette.secondary.light})`
      : 'none',
  'zIndex': '0',
  '& > svg': {
    'position': 'absolute',
    'width': '100%',
    'zIndex': '-1',
    'left': 0,
    '&.top': {
      top: 0,
    },
    '&.bottom': {
      bottom: 0,
      transform: 'rotate(180deg)',
    },
  },
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
    'justifyContent': 'flex-start',
    '& > button': {
      justifySelf: 'center',
    },
  },
  [theme.breakpoints.up('laptop')]: {
    gridTemplateColumns: '8fr 4fr',
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
      <Background>
        <CubeNetSvg color="primary" className="top" />
        <CubeNetSvg color="secondary" className="bottom" />
      </Background>
      <FormProvider {...methods}>
        <NetworkProvider>
          <WalletProvider>
            <BalanceProvider>
              <MaxTransferProvider>
                <TransactionFeesProvider>
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

                    <Box
                      sx={{
                        gridColumn: '1 / -1',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 3,
                      }}
                    >
                      {(methods.getValues().source == NETWORKS.binance.key ||
                        methods.getValues().source ==
                          NETWORKS.ethereum.key) && (
                        <Alert
                          severity="warning"
                          sx={{
                            textAlign: 'justify',
                          }}
                        >
                          If you are using Ledger, you may need to enable
                          &apos;Blind signing&apos; and &apos;Debug data&apos;
                          in the Ledger (Ethereum &gt; Settings) due to{' '}
                          <a href="https://github.com/LedgerHQ/app-ethereum/issues/311">
                            a known issue in Ledger and MetaMask interaction
                          </a>
                          .
                        </Alert>
                      )}
                      <Box
                        sx={(theme) => ({
                          [theme.breakpoints.up('laptop')]: {
                            width: '33%',
                            marginRight: theme.spacing(4),
                          },
                          [theme.breakpoints.up('tablet')]: {
                            width: '48%',
                          },
                          [theme.breakpoints.up('mobile')]: {
                            width: '100%',
                          },
                        })}
                      >
                        <ConnectOrSubmitButton
                          setChooseWalletsModalOpen={setChooseWalletsModalOpen}
                        />
                      </Box>
                    </Box>
                  </BridgeContainer>
                </TransactionFeesProvider>
              </MaxTransferProvider>
            </BalanceProvider>
          </WalletProvider>
        </NetworkProvider>
      </FormProvider>
    </>
  );
};

export default RosenBridge;
