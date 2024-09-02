'use client';

import { useForm, FormProvider } from 'react-hook-form';

import { styled } from '@rosen-bridge/ui-kit';

import { BridgeTransaction } from './BridgeTransaction';
import { BridgeForm } from './BridgeForm';
import { RosenAmountValue } from '@rosen-ui/types';
import { ConnectOrSubmitButton } from './ConnectOrSubmitButton';
import { useState } from 'react';

const BridgeContainer = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2.5),
  gridTemplateColumns: '8fr 4fr',
  gridTemplateRows: '1fr auto',
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
        <ConnectOrSubmitButton
          setChooseWalletsModalOpen={setChooseWalletsModalOpen}
        />
      </BridgeContainer>
    </FormProvider>
  );
};

export default RosenBridge;
