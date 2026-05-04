'use client';

import { useForm, FormProvider } from 'react-hook-form';

import { RosenChainToken } from '@rosen-bridge/tokens';
import { Alert, Typography } from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';

import {
  BalanceProvider,
  MaxTransferProvider,
  NetworkProvider,
  TransactionFeesProvider,
  WalletProvider,
} from '@/hooks';

import { BridgeForm } from './BridgeForm';
import { SubmitButton } from './SubmitButton';
import { TransactionInfo } from './TransactionInfo';
import { WalletInfo } from './WalletInfo';

export interface BridgeForm {
  source: Network | null;
  target: Network | null;
  token: RosenChainToken | null;
  walletAddress: string;
  amount: string;
}

const RosenBridge = () => {
  const methods = useForm<BridgeForm>({
    mode: 'onBlur',
    defaultValues: {
      source: null,
      target: null,
      token: null,
      walletAddress: '',
      amount: '',
    },
  });

  return (
    <>
      <FormProvider {...methods}>
        <NetworkProvider>
          <WalletProvider>
            <BalanceProvider>
              <MaxTransferProvider>
                <TransactionFeesProvider>
                  <div className="form">
                    <BridgeForm />
                  </div>
                  <div className="info">
                    <WalletInfo />
                    <TransactionInfo />
                  </div>
                  {/* 
                    TODO: Add a condition that activates this alert specifically when MetaMask is selected
                    local:ergo/rosen-bridge/ui#486
                    */}

                  {(methods.getValues().source == NETWORKS.binance.key ||
                    methods.getValues().source == NETWORKS.ethereum.key) && (
                    <div className="alert">
                      <Alert
                        severity="warning"
                        style={{
                          textAlign: 'justify',
                        }}
                      >
                        If you are using Ledger, you may need to enable
                        &apos;Blind signing&apos; and &apos;Debug data&apos; in
                        the Ledger (Ethereum &gt; Settings) due to{' '}
                        <Typography
                          color="primary"
                          component="a"
                          target="_blank"
                          href="https://github.com/LedgerHQ/app-ethereum/issues/311"
                        >
                          a known issue in Ledger and MetaMask interaction
                        </Typography>
                        .
                      </Alert>
                    </div>
                  )}
                  <div className="action">
                    <SubmitButton />
                  </div>
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
