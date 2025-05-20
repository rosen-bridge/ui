import { FunctionComponent, SVGProps, useMemo } from 'react';
import { UseControllerProps, useFormContext, useWatch } from 'react-hook-form';

import { SvgIcon } from '@mui/material';

import { InputSelect } from './InputSelect';

interface InputSelectNetworkProps<OptionType> {
  name: string;
  label?: string;
  options: OptionType[];
  defaultValue?: string | null;
  disabled?: boolean;
  rules?: UseControllerProps['rules'];
}

export const InputSelectNetwork = <OptionType,>({
  name,
  label,
  options,
  defaultValue,
  disabled,
  rules,
}: InputSelectNetworkProps<OptionType>) => {
  const { control } = useFormContext();
  const value = useWatch({
    control,
    name,
    defaultValue,
  });
  const optionKey = 'name' as keyof OptionType;
  const optionLabel = 'label' as keyof OptionType;
  const optionLogo = 'logo' as keyof OptionType;
  const startAdornment = useMemo(() => {
    const selectedOption = options.find(
      (option) => option[optionKey] === value,
    );
    if (!selectedOption) return undefined;
    const Logo = selectedOption[optionLogo] as FunctionComponent<
      SVGProps<SVGSVGElement>
    >;
    return (
      <SvgIcon sx={{ color: 'text.primary' }}>
        <Logo />
      </SvgIcon>
    );
  }, [value]);

  return (
    <InputSelect
      name={name}
      label={label}
      options={options}
      optionKey={optionKey}
      optionLabel={optionLabel}
      defaultValue={defaultValue}
      rules={rules}
      disabled={disabled}
      disableClearable
      startAdornment={startAdornment}
      renderOption={(props, option) => {
        const Logo = option[optionLogo] as FunctionComponent<
          SVGProps<SVGSVGElement>
        >;
        return (
          <li {...props} key={option[optionKey] as string}>
            <SvgIcon style={{ marginRight: '16px' }}>
              <Logo />
            </SvgIcon>
            {option[optionLabel] as string}
          </li>
        );
      }}
    />
  );
};
