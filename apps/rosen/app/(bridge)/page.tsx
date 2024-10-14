'use client';

import { useForm, FormProvider } from 'react-hook-form';

import {
  Alert,
  Card,
  Divider,
  styled,
  useResponsiveValue,
} from '@rosen-bridge/ui-kit';

import { BridgeTransaction } from './BridgeTransaction';
import { BridgeForm } from './BridgeForm';
import { RosenAmountValue } from '@rosen-ui/types';
import { NETWORKS } from '@rosen-ui/constants';

const Root = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -60%)',
  margin: '0 auto',
  minWidth: 0,
  width: '100%',
  [theme.breakpoints.up('tablet')]: {
    minWidth: '600px',
    maxWidth: '50vmax',
  },
}));

const BridgeContainer = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(2),
  display: 'grid',
  gap: theme.spacing(1.5),
  padding: theme.spacing(3),
  gridTemplateColumns: '1fr',
  gridTemplateRows: '5fr 5px auto',
  [theme.breakpoints.up('tablet')]: {
    gridTemplateColumns: '3fr auto 2fr',
    gridTemplateRows: '1fr',
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
  const separatorOrientation = useResponsiveValue({
    mobile: 'horizontal',
    tablet: 'vertical',
  });

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
      <Root>
        <BridgeContainer>
          <BridgeForm />
          <Divider orientation={separatorOrientation} flexItem />
          <BridgeTransaction />
        </BridgeContainer>
        {methods.getValues().source == NETWORKS.ETHEREUM && (
          <Alert severity="warning" sx={{ textAlign: 'justify', mt: 2 }}>
            If you are using Ledger, you may need to enable &apos;Blind
            signing&apos; and &apos;Debug data&apos; in the Ledger (Ethereum
            &gt; Settings) due to{' '}
            <a href="https://github.com/LedgerHQ/app-ethereum/issues/311">
              a known issue in Ledger and MetaMask interaction
            </a>
            .
          </Alert>
        )}
      </Root>
    </FormProvider>
  );
};

export default RosenBridge;
