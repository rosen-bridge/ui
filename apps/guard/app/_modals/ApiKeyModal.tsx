import { useState } from 'react';

import { KeySkeleton, Eye, EyeSlash, Times } from '@rosen-bridge/icons';
import { useForm, Controller } from 'react-hook-form';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tooltip,
  IconButton,
  InputAdornment,
  SvgIcon,
  TextField,
  Typography,
  useSnackbar,
} from '@rosen-bridge/ui-kit';

import { useApiKey } from '@/_hooks/useApiKey';

interface FormValues {
  apiKey: string;
}

const ApiKeyModal = () => {
  const [open, setOpen] = useState(false);
  const { openSnackbar } = useSnackbar();

  const [showKey, setShowKey] = useState(false);

  const handleOpenModal = () => setOpen(true);
  const handleCloseModal = () => setOpen(false);

  const handleToggleShowKey = () => setShowKey((prevState) => !prevState);

  const { apiKey, setApiKey } = useApiKey();

  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      apiKey: apiKey || '',
    },
  });

  const handleSetKey = (values: FormValues) => {
    setApiKey(values.apiKey);
    handleCloseModal();
    openSnackbar('This is a success message!', 'success', {
      horizontal: 'left',
      vertical: 'top',
    });
  };

  return (
    <>
      <IconButton
        onClick={handleOpenModal}
        size="large"
        color={apiKey ? 'primary' : 'default'}
      >
        <SvgIcon sx={{ width: 24 }}>
          <KeySkeleton />
        </SvgIcon>
      </IconButton>
      <Dialog
        open={open}
        onClose={handleCloseModal}
        maxWidth="tablet"
        fullWidth
      >
        <DialogTitle>Authorization</DialogTitle>
        <form onSubmit={handleSubmit(handleSetKey)}>
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
                          <IconButton>
                            <SvgIcon sx={{ width: 24 }}>
                              <Times />
                            </SvgIcon>
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={showKey ? 'Hide key' : 'Show key'}>
                          <IconButton onClick={handleToggleShowKey}>
                            <SvgIcon sx={{ width: 24 }}>
                              {showKey ? <EyeSlash /> : <Eye />}
                            </SvgIcon>
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
            <Button type="submit">Set key</Button>
            <Button onClick={handleCloseModal}>Cancel</Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default ApiKeyModal;
