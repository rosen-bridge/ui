import { FunctionComponent, SVGProps, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

import { SvgIcon } from '@mui/material';

import { InputSelect } from './InputSelect';

export interface InputSelectNetworkProps<OptionType> {
  name: string;
  label?: string;
  options: OptionType[];
  defaultValue?: OptionType | null;
  disabled?: boolean;
  required?: boolean;
  validate?: (value: string) => Promise<string | undefined>;
  onValueChange?: (value: OptionType | null) => void;
}

export const InputSelectNetwork = <OptionType,>({
  name,
  label,
  options,
  defaultValue,
  disabled,
  required,
  validate,
  onValueChange,
}: InputSelectNetworkProps<OptionType>) => {
  const { watch } = useFormContext();
  const value = watch(name) as OptionType | null;
  const optionKey = 'name' as keyof OptionType;
  const optionLabel = 'label' as keyof OptionType;
  const optionLogo = 'logo' as keyof OptionType;
  const startAdornment = useMemo(() => {
    if (!value) return undefined;
    const Logo = value[optionLogo] as FunctionComponent<
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
      disabled={disabled}
      required={required}
      validate={validate}
      onValueChange={onValueChange}
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
