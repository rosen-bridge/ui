import { FormEvent, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import {
  InputAdornment,
  TextField,
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
  Tooltip,
} from '@/components';
import { useApiKey, useConfig, useToast } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ApiKeyDialogOverrides {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type ApiKeyDialogOwnProps = {};

export type ApiKeyDialogBaseProps = ElementBaseProps<
  typeof Dialog,
  ApiKeyDialogOwnProps
>;

export type ApiKeyDialogProps = OverridableType<
  ApiKeyDialogBaseProps,
  ApiKeyDialogOverrides,
  never
>;

type FormValues = {
  apiKey: string;
};

export const ApiKeyDialog = (props: ApiKeyDialogProps) => {
  const { open, onClose, ...rest } = useConfig('ApiKeyDialog', props);

  const { apiKey, setApiKey } = useApiKey();

  const toast = useToast();

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
    toast.add({
      type: 'success',
      description: 'API key is set!',
    });
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
      <Dialog maxWidth="tablet" open={open} onClose={onClose} {...rest}>
        <DialogHeader>
          <DialogTitle>Authorization</DialogTitle>
        </DialogHeader>
        <DialogDescription>Set API key to access actions</DialogDescription>
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
      </Dialog>
    </>
  );
};

ApiKeyDialog.displayName = 'ApiKeyDialog';
