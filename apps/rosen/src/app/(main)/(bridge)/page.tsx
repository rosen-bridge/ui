'use client';

import { FormProvider, useForm } from 'react-hook-form';

import { Alert, Link } from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import type { RosenAmountValue } from '@rosen-ui/types';

import { NetworkProvider, TransactionFeesProvider, WalletProvider } from '@/hooks';

import { BridgeForm as BridgeFormComponent } from './BridgeForm';
import { SubmitButton } from './SubmitButton';
import { TransactionInfo } from './TransactionInfo';
import { WalletInfo } from './WalletInfo';

import './page.css';

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
                {!!process.env.NEXT_PUBLIC_BRIDGE_WARNING_MESSAGE && (
                  <Alert
                    severity="error"
                    style={{
                      textAlign: 'justify',
                      gridColumn: '1 / -1',
                    }}
                  >
                    {process.env.NEXT_PUBLIC_BRIDGE_WARNING_MESSAGE}
                  </Alert>
                )}
                <div className="rosen-bridge-page-form">
                  <BridgeFormComponent />
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
                      severity="error"
                      style={{
                        textAlign: 'justify',
                        marginBottom: '8px',
                      }}
                    >
                      On the MetaMask confirmation screen, uncheck <b>Added protection</b> if it
                      appears. Rosen cannot yet detect transfers sent with that option, and your
                      tokens will reach the bridge address without the transfer being processed
                      recovering them then requires manual support. For the same reason, do not
                      enable <b>Smart account</b> for this network in MetaMask. Everything else in
                      MetaMask, including its scam and phishing warnings, should stay on. We are
                      working on support for both features.
                    </Alert>
                    <Alert
                      severity="warning"
                      style={{
                        textAlign: 'justify',
                      }}
                    >
                      If you are using Ledger, you may need to enable &apos;Blind signing&apos; and
                      &apos;Debug data&apos; in the Ledger (Ethereum &gt; Settings) due to{' '}
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
                {methods.watch('source') === NETWORKS.firo.key && (
                  <div className="rosen-bridge-page-alert">
                    <Alert severity="warning">
                      Use only the latest version of Campfire, Stack Wallet, or Firo-Qt to bridge
                      from Firo. Other wallets are not supported and may result in loss of funds.
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
