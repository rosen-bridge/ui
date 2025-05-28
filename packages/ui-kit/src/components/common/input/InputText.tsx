import { ReactNode } from 'react';
import {
  useController,
  UseControllerProps,
  useFormContext,
} from 'react-hook-form';

import { IconButton, InputAdornment, SvgIcon, TextField } from '@mui/material';
import { ClipboardNotes } from '@rosen-bridge/icons';

export interface InputTextProps {
  name: string;
  label?: string;
  disabled?: boolean;
  placeholder?: string;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  enablePasteButton?: boolean;
  rows?: number;
  defaultValue?: string | null;
  rules?: UseControllerProps['rules'];
}
export const InputText = ({
  name,
  startAdornment,
  endAdornment,
  defaultValue,
  rules,
  enablePasteButton,
  rows,
  ...restProps
}: InputTextProps) => {
  const { control, setValue } = useFormContext();
  const {
    field,
    fieldState: { invalid, error },
  } = useController({
    name,
    control,
    rules,
    defaultValue,
  });

  return (
    <TextField
      onChange={field.onChange}
      onBlur={field.onBlur}
      value={field.value || ''}
      name={field.name}
      inputRef={field.ref}
      multiline={!!rows}
      rows={rows}
      error={invalid}
      helperText={error?.message}
      InputProps={{
        startAdornment: startAdornment ? (
          <InputAdornment position="start">{startAdornment}</InputAdornment>
        ) : undefined,
        endAdornment:
          endAdornment || enablePasteButton ? (
            <InputAdornment position="end">
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
