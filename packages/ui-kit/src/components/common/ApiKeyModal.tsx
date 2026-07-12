import type React from 'react';
import { type FormEvent, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Button, IconButton, Tooltip, Typography } from '@mui/material';

import { useApiKey, useToast } from '../../hooks';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  TextField,
} from '../base';
import { CloseButton } from '../closeButton';
import { Icon } from '../icon';

interface FormValues {
  apiKey: string;
}

export interface ApiKeyModalProps {
  children?: (open: () => void) => React.ReactNode;
}

export const ApiKeyModal = ({ children }: ApiKeyModalProps) => {
  const { apiKey, setApiKey } = useApiKey();
  const toast = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const handleOpenModal = () => setIsOpen(true);
  const handleCloseModal = () => setIsOpen(false);

  const [showKey, setShowKey] = useState(false);
  const handleToggleShowKey = () => setShowKey((prevState) => !prevState);

  const { control, handleSubmit, reset, setValue } = useForm<FormValues>({
    defaultValues: {
      apiKey: apiKey || '',
    },
  });

  const handleSetKey = (values: FormValues) => {
    setApiKey(values.apiKey);
    handleCloseModal();
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
    isOpen && setValue('apiKey', apiKey || '');
  }, [apiKey, isOpen, setValue]);

  return (
    <>
      {children?.(handleOpenModal) || (
        <IconButton onClick={handleOpenModal} color="inherit">
          <Icon name="KeySkeleton" />
        </IconButton>
      )}
      <Dialog
        open={isOpen}
        onClose={handleCloseModal}
        maxWidth="tablet"
        fullWidth
      >
        <DialogTitle>Authorization</DialogTitle>
        <form onSubmit={onSubmit}>
          <DialogContent dividers>
            <Typography gutterBottom>Set API key to access actions</Typography>
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
                  InputProps={{
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
                  }}
                />
              )}
            ></Controller>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit">Set key</Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};
