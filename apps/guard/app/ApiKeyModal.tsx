import { KeySkeleton, Eye, EyeSlash, Times } from '@rosen-bridge/icons';
import {
  Alert,
  AlertProps,
  LoadingButton,
  Snackbar,
} from '@rosen-bridge/ui-kit';
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
} from '@rosen-bridge/ui-kit';
import { Fragment, useState } from 'react';

const ApiKeyModal = () => {
  const [open, setOpen] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    severity: 'error',
    message: '',
  });
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpenModal = () => setOpen(true);
  const handleCloseModal = () => setOpen(false);
  const handleCloseAlert = () =>
    setAlert((prevState) => ({ ...prevState, open: false }));
  const handleToggleShowKey = () => setShowKey((prevState) => !prevState);
  const handleSetKey = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (Math.random() >= 0.5) {
        handleCloseModal();
        setAlert({
          open: true,
          severity: 'success',
          message: 'This is a success message!',
        });
      } else {
        setAlert({
          open: true,
          severity: 'error',
          message: 'This is an error message!',
        });
      }
    }, 1000);
  };

  return (
    <Fragment>
      <IconButton onClick={handleOpenModal} size="large">
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
        <DialogContent dividers>
          <Typography gutterBottom>Set API key to access actions</Typography>
          <TextField
            type={showKey ? 'text' : 'password'}
            fullWidth
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
        </DialogContent>
        <DialogActions>
          <LoadingButton loading={loading} onClick={handleSetKey}>
            Set key
          </LoadingButton>
          <Button disabled={loading} onClick={handleCloseModal}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={alert.open} onClose={handleCloseAlert}>
        <Alert severity={alert.severity as AlertProps['severity']}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Fragment>
  );
};

export default ApiKeyModal;
