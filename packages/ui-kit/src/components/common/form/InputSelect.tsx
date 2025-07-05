import { HTMLAttributes, ReactNode } from 'react';
import { useController, useFormContext } from 'react-hook-form';

import { Autocomplete, InputAdornment, TextField } from '@mui/material';

export interface InputSelectProps<OptionType> {
  name: string;
  label?: string;
  defaultValue?: OptionType | null;
  options: OptionType[];
  optionKey: keyof OptionType;
  optionLabel?: keyof OptionType;
  renderOption?: (
    props: HTMLAttributes<HTMLLIElement>,
    option: OptionType,
  ) => ReactNode;
  disableClearable?: boolean;
  startAdornment?: ReactNode;
  disabled?: boolean;
  required?: boolean;
  validate?: (value: string) => Promise<string | undefined>;
  onValueChange?: (value: OptionType | null) => void;
}

export const InputSelect = <OptionType,>({
  name,
  label,
  options,
  optionKey,
  optionLabel = optionKey,
  renderOption,
  defaultValue,
  disabled,
  disableClearable,
  startAdornment,
  required,
  validate,
  onValueChange,
}: InputSelectProps<OptionType>) => {
  const { control, setValue } = useFormContext();
  const {
    field,
    fieldState: { invalid, error },
  } = useController({
    name,
    control,
    rules: {
      required: required
        ? `Please select the ${label?.toLowerCase()}!`
        : undefined,
      validate,
    },
    defaultValue,
  });

  return (
    <Autocomplete
      value={field.value}
      onChange={(event, newValue: OptionType | null) => {
        setValue(name, newValue);
        onValueChange && onValueChange(newValue);
      }}
      onBlur={field.onBlur}
      disabled={disabled}
      disableClearable={disableClearable}
      options={options}
      renderOption={renderOption}
      isOptionEqualToValue={(option: OptionType, value: OptionType) =>
        option[optionKey] === value[optionKey]
      }
      getOptionLabel={(option: OptionType) =>
        (option[optionLabel] as string) ?? option
      }
      renderInput={({ InputProps, ...params }) => (
        <TextField
          label={label}
          name={name}
          ref={field.ref}
          InputProps={{
            ...InputProps,
            startAdornment: startAdornment ? (
              <InputAdornment position="start">{startAdornment}</InputAdornment>
            ) : undefined,
          }}
          {...params}
          error={invalid}
          helperText={error?.message}
        />
      )}
    />
  );
};
