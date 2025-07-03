import { ChangeEvent, ReactNode } from 'react';
import { useController, useFormContext } from 'react-hook-form';

import {
  CircularProgress,
  IconButton,
  InputAdornment,
  SvgIcon,
  TextField,
} from '@mui/material';
import { ClipboardNotes } from '@rosen-bridge/icons';

export interface InputTextProps {
  name: string;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  rows?: number;
  enablePasteButton?: boolean;
  disabled?: boolean;
  required?: boolean;
  minLength?: number | { value: number; message: string };
  maxLength?: number | { value: number; message: string };
  validate?: (value: string) => Promise<string | undefined>;
  onValueChange?: (value: string) => string | void;
}
export const InputText = ({
  name,
  label,
  startAdornment,
  endAdornment,
  defaultValue,
  enablePasteButton,
  rows,
  required,
  minLength,
  maxLength,
  validate,
  onValueChange,
  ...restProps
}: InputTextProps) => {
  const { control, setValue } = useFormContext();
  const {
    field,
    fieldState: { invalid, error },
    formState: { isValidating },
  } = useController({
    name,
    control,
    rules: {
      required: required
        ? `Please enter the ${label?.toLowerCase()}!`
        : undefined,
      minLength:
        typeof minLength == 'number'
          ? { value: minLength, message: `At least ${minLength} characters!` }
          : minLength,
      maxLength:
        typeof maxLength == 'number'
          ? { value: maxLength, message: `Reduce to ${maxLength} characters!` }
          : maxLength,
      validate,
    },
    defaultValue,
  });

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (onValueChange && onValueChange(event.target.value)) {
      setValue(name, onValueChange(event.target.value));
    } else {
      field.onChange(event);
    }
  };

  return (
    <TextField
      onChange={onChange}
      onBlur={field.onBlur}
      value={field.value || ''}
      name={field.name}
      inputRef={field.ref}
      label={label}
      multiline={!!rows}
      rows={rows}
      error={invalid}
      helperText={error?.message}
      autoComplete="off"
      InputProps={{
        startAdornment: startAdornment ? (
          <InputAdornment position="start">{startAdornment}</InputAdornment>
        ) : undefined,
        endAdornment:
          isValidating || endAdornment || enablePasteButton ? (
            <InputAdornment position="end">
              {isValidating && <CircularProgress size={20} sx={{ mx: 1 }} />}
              {endAdornment}
              {enablePasteButton && (
                <IconButton
                  onClick={() => {
                    navigator.clipboard.readText().then((text) => {
                      setValue(name, text.trim(), {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      });
                    });
                  }}
                  size="small"
                >
                  <SvgIcon>
                    <ClipboardNotes />
                  </SvgIcon>
                </IconButton>
              )}
            </InputAdornment>
          ) : undefined,
      }}
      {...restProps}
    />
  );
};
