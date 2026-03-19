import { ComponentProps, FormEvent, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import {
  Button,
  CloseButton,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Icon,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
} from '@/components';
import { ElementBaseProps, Root, Wrap } from '@/core';
import { useApiKey, useSnackbar } from '@/hooks';
import { OverridableType } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ApiKeyDialogOverrides {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type ApiKeyDialogOwnProps = {};

export type ApiKeyDialogBaseProps = ElementBaseProps<
  typeof Dialog,
  ApiKeyDialogOwnProps
>;

export type ApiKeyDialogOverriddenProps = OverridableType<
  ApiKeyDialogBaseProps,
  ApiKeyDialogOverrides,
  never
>;

type FormValues = {
  apiKey: string;
};

export const ApiKeyDialogBase = ({
  open,
  onClose,
  ...rest
}: ApiKeyDialogOverriddenProps) => {
  const { apiKey, setApiKey } = useApiKey();

  const { openSnackbar } = useSnackbar();

  const [showKey, setShowKey] = useState(false);

  const { control, handleSubmit, reset, setValue } = useForm<FormValues>({
    defaultValues: {
      apiKey: apiKey || '',
    },
  });

  const handleToggleShowKey = () => setShowKey((prevState) => !prevState);

  const handleSetKey = (values: FormValues) => {
    setApiKey(values.apiKey);
    onClose?.();
    openSnackbar('API key is set!', 'success');
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.stopPropagation();
    handleSubmit(handleSetKey)(event);
  };

  useEffect(() => {
    open && setValue('apiKey', apiKey || '');
  }, [apiKey, open, setValue]);

  return (
    <>
      <Root
        as={Dialog}
        maxWidth="tablet"
        open={open}
        onClose={onClose}
        {...rest}
      >
        <DialogHeader>
          <DialogTitle>Authorization</DialogTitle>
        </DialogHeader>
        <DialogDescription>Set API key to access actions</DialogDescription>
        {/* TODO dividers */}
        <DialogContent>
          <form id="api-key-form" onSubmit={onSubmit}>
            <Controller
              name="apiKey"
              control={control}
              {...(apiKey ? { defaultValue: apiKey } : {})}
              render={({ field }) => (
                <TextField
                  type={showKey ? 'text' : 'password'}
                  autoFocus
                  fullWidth
                  {...field}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="Clear">
                            <CloseButton onClick={() => reset()} />
                          </Tooltip>
                          <Tooltip title={showKey ? 'Hide key' : 'Show key'}>
                            <IconButton onClick={handleToggleShowKey}>
                              <Icon name={showKey ? 'EyeSlash' : 'Eye'} />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              )}
            />
          </form>
        </DialogContent>
        <DialogFooter>
          <Button onClick={onClose}>Cancel</Button>
          <Button form="api-key-form" type="submit">
            Set key
          </Button>
        </DialogFooter>
      </Root>
    </>
  );
};

ApiKeyDialogBase.displayName = 'ApiKeyDialog';

export const ApiKeyDialog = Wrap(ApiKeyDialogBase);

export type ApiKeyDialogProps = ComponentProps<typeof ApiKeyDialog>;
