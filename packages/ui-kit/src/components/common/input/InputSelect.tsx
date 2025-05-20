import { HTMLAttributes, ReactNode } from 'react';
import {
  useController,
  UseControllerProps,
  useFormContext,
} from 'react-hook-form';

import { Autocomplete, InputAdornment, TextField } from '@mui/material';

interface InputSelectProps<OptionType> {
  name: string;
  label?: string;
  options: OptionType[];
  optionKey: keyof OptionType;
  optionLabel?: keyof OptionType;
  renderOption?: (
    props: HTMLAttributes<HTMLLIElement>,
    option: OptionType,
  ) => ReactNode;
  defaultValue?: string | null;
  disabled?: boolean;
  disableClearable?: boolean;
  startAdornment?: ReactNode;
  rules?: UseControllerProps['rules'];
}

export const InputSelect = <OptionType,>({
  name,
  label,
  options,
  optionKey,
  optionLabel = 'label' as keyof OptionType,
  renderOption,
  defaultValue,
  disabled,
  disableClearable,
  startAdornment,
  rules,
}: InputSelectProps<OptionType>) => {
  const { control, setValue } = useFormContext();
  const { field } = useController({
    name,
    control,
    rules,
    defaultValue,
  });

  return (
    <Autocomplete
      value={
        options.find(
          (option: OptionType) => option[optionKey] === field.value,
        ) ?? null
      }
      onChange={(event, newValue: OptionType | null) => {
        setValue(name, newValue?.[optionKey] || null);
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
        />
      )}
    />
  );
};
