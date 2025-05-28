import { ReactNode } from 'react';
import {
  useForm as useReactHookForm,
  FormProvider as ReactHookFormProvider,
  FieldValues,
  DefaultValues,
  SubmitHandler,
} from 'react-hook-form';

interface UseFormProps<FormValues extends FieldValues> {
  defaultValues?: DefaultValues<FormValues>;
  mode?: 'onBlur' | 'onChange' | 'onSubmit' | 'onTouched' | 'all';
  onSubmit?: SubmitHandler<FormValues>;
}

// export type FormInputs = {
//   [key: string]:
//     | InputTextProps
//     | InputSelectProps<undefined>
//     | InputSelectNetworkProps<undefined>;
// };

export function useForm<FormValues extends FieldValues>({
  defaultValues,
  mode,
  onSubmit,
}: UseFormProps<FormValues>) {
  const methods = useReactHookForm<FormValues>({
    defaultValues,
    mode,
  });

  const FormProvider = ({ children }: { children?: ReactNode }) => (
    <ReactHookFormProvider {...methods}>{children}</ReactHookFormProvider>
  );

  const Form = ({ children }: { children?: ReactNode }) => (
    <form onSubmit={onSubmit && methods.handleSubmit(onSubmit)}>
      {children}
    </form>
  );

  return [methods, FormProvider, Form] as const;
}
