'use client';

import { useForm, FormProvider } from 'react-hook-form';

import { RosenChainToken } from '@rosen-bridge/tokens';
import { Alert } from '@rosen-bridge/ui-kit';
import { Network } from '@rosen-network/base';
import { NETWORKS } from '@rosen-ui/constants';

import {
  BalanceProvider,
  MaxTransferProvider,
  NetworkProvider,
  TransactionFeesProvider,
  WalletProvider,
} from '@/_hooks';

import { BridgeForm } from './BridgeForm';
import { SubmitButton } from './SubmitButton';
import { TransactionInfo } from './TransactionInfo';
import { WalletInfo } from './WalletInfo';

export interface BridgeForm {
  source: Network | null;
  target: Network | null;
  token: RosenChainToken | null;
  walletAddress: string | null;
  amount: number | null;
}

const RosenBridge = () => {
  const methods = useForm<BridgeForm>({
    mode: 'onBlur',
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

                  {(methods.getValues().source?.name == NETWORKS.binance.key ||
                    methods.getValues().source?.name ==
                      NETWORKS.ethereum.key) && (
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
