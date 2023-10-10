import { Alert, Snackbar } from '../base';

interface SuccessfulCopySnackbarProps {
  open: boolean;
  handleClose: (event: React.SyntheticEvent | Event, reason?: string) => void;
}
/**
 * render a snackbar showing a successful copy to clipboard
 * @param handleClose
 * @param open
 */
export const SuccessfulCopySnackbar = ({
  open,
  handleClose,
}: SuccessfulCopySnackbarProps) => (
  <Snackbar open={open} autoHideDuration={2000} onClose={handleClose}>
    <Alert onClose={handleClose} severity="success" variant="filled">
      Address copied to clipboard!
    </Alert>
  </Snackbar>
);
