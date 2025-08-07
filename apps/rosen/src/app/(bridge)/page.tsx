'use client';

import { useForm, FormProvider } from 'react-hook-form';

import { Alert } from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import { RosenAmountValue } from '@rosen-ui/types';

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
  source: string | null;
  target: string | null;
  token: string | null;
  walletAddress: string | null;
  amount: RosenAmountValue | null;
}

const RosenBridge = () => {
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
                        sx={{
                          textAlign: 'justify',
                        }}
                      >
                        If you are using Ledger, you may need to enable
                        &apos;Blind signing&apos; and &apos;Debug data&apos; in
                        the Ledger (Ethereum &gt; Settings) due to{' '}
                        <a href="https://github.com/LedgerHQ/app-ethereum/issues/311">
                          a known issue in Ledger and MetaMask interaction
                        </a>
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
