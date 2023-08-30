import {
  useForm,
  useController,
  useWatch,
  FormProvider,
  useFormContext,
} from 'react-hook-form';

const useTransactionFormData = () => {
  const { control, ...rest } = useFormContext();

  const sourceValue = useWatch({ control, name: 'source' });
  const targetValue = useWatch({ control, name: 'target' });
  const tokenValue = useWatch({ control, name: 'token' });
  const amountValue = useWatch({ control, name: 'amount' });

  return {
    sourceValue,
    targetValue,
    tokenValue,
    amountValue,
    control,
    ...rest,
  };
};

export default useTransactionFormData;
