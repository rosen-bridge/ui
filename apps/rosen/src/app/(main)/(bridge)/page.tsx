'use client';

import { FormProvider, useForm } from 'react-hook-form';

import { Alert, Link } from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import type { RosenAmountValue } from '@rosen-ui/types';

import {
  NetworkProvider,
  TransactionFeesProvider,
  WalletProvider,
} from '@/hooks';

import { BridgeForm } from './BridgeForm';
import './page.css';
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
    <div className="rosen-bridge-page-wrapper">
      <FormProvider {...methods}>
        <NetworkProvider>
          <WalletProvider>
            <TransactionFeesProvider>
              <div className="rosen-bridge-page-main">
                <div className="rosen-bridge-page-form">
                  <BridgeForm />
                </div>
                <div className="rosen-bridge-page-info">
                  <WalletInfo />
                  <TransactionInfo />
                </div>
                {/*
                TODO: Add a condition that activates this alert specifically when MetaMask is selected
                local:ergo/rosen-bridge/ui#486
                */}

                {(methods.getValues().source === NETWORKS.binance.key ||
                  methods.getValues().source === NETWORKS.ethereum.key) && (
                  <div className="rosen-bridge-page-alert">
                    <Alert
                      severity="warning"
                      style={{
                        textAlign: 'justify',
                      }}
                    >
                      If you are using Ledger, you may need to enable
                      &apos;Blind signing&apos; and &apos;Debug data&apos; in
                      the Ledger (Ethereum &gt; Settings) due to{' '}
                      <Link
                        color="primary"
                        target="_blank"
                        href="https://github.com/LedgerHQ/app-ethereum/issues/311"
                      >
                        a known issue in Ledger and MetaMask interaction
                      </Link>
                      .
                    </Alert>
                  </div>
                )}
                <div className="rosen-bridge-page-action">
                  <SubmitButton />
                </div>
              </div>
            </TransactionFeesProvider>
          </WalletProvider>
        </NetworkProvider>
      </FormProvider>
    </div>
  );
};

export default RosenBridge;
