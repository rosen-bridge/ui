'use client';

import { useForm, FormProvider } from 'react-hook-form';

import {
  Card,
  Divider,
  styled,
  useResponsiveValue,
} from '@rosen-bridge/ui-kit';

import { BridgeTransaction } from './BridgeTransaction';
import { BridgeForm } from './BridgeForm';
import { RosenAmountValue } from '@rosen-ui/types';

const BridgeContainer = styled(Card)(({ theme }) => ({
  position: 'absolute',
  top: '20%',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(2),
  margin: '0 auto',
  display: 'grid',
  minWidth: 0,
  gap: theme.spacing(1.5),
  padding: theme.spacing(3),
  width: '100%',
  gridTemplateColumns: '1fr',
  gridTemplateRows: '5fr 5px auto',
  [theme.breakpoints.up('tablet')]: {
    gridTemplateColumns: '3fr auto 2fr',
    gridTemplateRows: '1fr',
    minWidth: '600px',
    maxWidth: '50vmax',
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
      <BridgeContainer>
        <BridgeForm />
        <Divider orientation={separatorOrientation} flexItem />
        <BridgeTransaction />
      </BridgeContainer>
    </FormProvider>
  );
};

export default RosenBridge;
