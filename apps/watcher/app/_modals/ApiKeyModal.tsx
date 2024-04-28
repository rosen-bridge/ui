import { useState } from 'react';

import { KeySkeleton, Eye, EyeSlash, Times } from '@rosen-bridge/icons';
import { useForm, Controller } from 'react-hook-form';
import { useModalManager } from '@rosen-ui/common-hooks';

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

import { useApiKey } from '@rosen-bridge/shared-contexts';

interface FormValues {
  apiKey: string;
}

export interface ApiKeyModalProps {
  children?: (open: () => void) => React.ReactNode;
}

const ApiKeyModal = ({ children }: ApiKeyModalProps) => {
  const { apiKey, setApiKey } = useApiKey();
  const { openSnackbar } = useSnackbar();

  const { isOpen, handleOpenModal, handleCloseModal } = useModalManager();

  const [showKey, setShowKey] = useState(false);
  const handleToggleShowKey = () => setShowKey((prevState) => !prevState);

  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      apiKey: apiKey || '',
    },
  });

  const handleSetKey = (values: FormValues) => {
    setApiKey(values.apiKey);
    handleCloseModal();
    openSnackbar('Api key is set!', 'success');
  };

  return (
    <>
      {children?.(handleOpenModal) || (
        <IconButton
          onClick={handleOpenModal}
          size="large"
          color={apiKey ? 'primary' : 'default'}
        >
          <SvgIcon sx={{ width: 24 }}>
            <KeySkeleton />
          </SvgIcon>
        </IconButton>
      )}
      <Dialog
        open={isOpen}
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
            <Button onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit">Set key</Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default ApiKeyModal;
