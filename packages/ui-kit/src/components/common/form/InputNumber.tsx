import { ChangeEvent, ReactNode, useEffect, useState } from 'react';
import { useController, useFormContext } from 'react-hook-form';

import { InputAdornment, TextField } from '@mui/material';

export interface InputNumberProps {
  name: string;
  label?: string;
  placeholder?: string;
  defaultValue?: number | null;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  size?: 'medium' | 'large';
  disabled?: boolean;
  required?: boolean;
  min?: number | { value: number; message: string };
  max?: number | { value: number; message: string };
  validate?: (value: number | null) => Promise<string | undefined>;
  onValueChange?: (value: number | null) => void;
}
export const InputNumber = ({
  name,
  label,
  startAdornment,
  endAdornment,
  size = 'medium',
  defaultValue,
  required,
  min,
  max,
  validate,
  onValueChange,
  ...restProps
}: InputNumberProps) => {
  const { control, setValue } = useFormContext();
  const [inputValue, setInputValue] = useState<string>('');
  const {
    field,
    fieldState: { invalid, error },
  } = useController({
    name,
    control,
    rules: {
      required: required
        ? `Please enter the ${label?.toLowerCase()}!`
        : undefined,
      min:
        typeof min == 'number'
          ? { value: min, message: `At least ${min}!` }
          : min,
      max:
        typeof max == 'number'
          ? { value: max, message: `Reduce to ${max}!` }
          : max,
      validate,
    },
    defaultValue,
  });

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    let targetValue = event.target.value;
    if (targetValue === '') {
      setInputValue('');
      setValue(name, null);
      if (onValueChange) onValueChange(null);
    } else if (targetValue === '.') {
      setInputValue('0.');
      setValue(name, 0);
      if (onValueChange) onValueChange(0);
    } else if (/^\d*\.?\d*$/.test(targetValue)) {
      if (/^0\d/.test(targetValue)) {
        targetValue = targetValue.slice(1);
      }
      setInputValue(targetValue);
      let parsed: number | null = Number(targetValue);
      if (isNaN(parsed)) {
        parsed = null;
      }
      setValue(name, parsed);
      if (onValueChange) onValueChange(parsed);
    }
  };

  useEffect(() => {
    setInputValue(defaultValue?.toString() || '');
  }, [defaultValue]);

  return (
    <TextField
      inputMode="decimal"
      onChange={onChange}
      onBlur={field.onBlur}
      value={inputValue}
      name={field.name}
      inputRef={field.ref}
      label={label}
      error={invalid}
      helperText={error?.message}
      autoComplete="off"
      inputProps={{
        style: size === 'large' ? { fontSize: '2rem' } : {},
      }}
      InputProps={{
        startAdornment: startAdornment ? (
          <InputAdornment position="start">{startAdornment}</InputAdornment>
        ) : undefined,
        endAdornment: endAdornment ? (
          <InputAdornment position="end">{endAdornment}</InputAdornment>
        ) : undefined,
      }}
      {...restProps}
    />
  );
};
