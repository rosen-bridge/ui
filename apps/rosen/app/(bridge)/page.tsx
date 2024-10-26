'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import { Alert, styled } from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import { RosenAmountValue } from '@rosen-ui/types';

import { BridgeTransaction } from './BridgeTransaction';
import { BridgeForm } from './BridgeForm';
import { ConnectOrSubmitButton } from './ConnectOrSubmitButton';

const BridgeContainer = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  maxWidth: theme.breakpoints.values.desktop,
  width: '100%',
  gap: theme.spacing(3),
  padding: theme.spacing(4),
  display: 'grid',
  gridTemplateColumns: '8fr 4fr',
  gridTemplateRows: '1fr auto auto',
  '& > button': {
    width: '50%',
    justifySelf: 'flex-end',
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
    <FormProvider {...methods}>
      <BridgeContainer>
        <BridgeForm />
        <BridgeTransaction
          chooseWalletsModalOpen={chooseWalletsModalOpen}
          setChooseWalletsModalOpen={setChooseWalletsModalOpen}
        />
        {methods.getValues().source == NETWORKS.ETHEREUM && (
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
    </FormProvider>
  );
};

export default RosenBridge;
