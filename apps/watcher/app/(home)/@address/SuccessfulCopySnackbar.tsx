import { Alert, Snackbar } from '@rosen-bridge/ui-kit';

interface SuccessfulCopySnackbarProps {
  open: boolean;
  handleClose: (event: React.SyntheticEvent | Event, reason?: string) => void;
}
/**
 * render a snackbar showing a successful copy to clipboard
 * @param handleClose
 * @param open
 */
const SuccessfulCopySnackbar = ({
  open,
  handleClose,
}: SuccessfulCopySnackbarProps) => (
  <Snackbar open={open} autoHideDuration={2000} onClose={handleClose}>
    <Alert onClose={handleClose} severity="success" variant="filled">
      Address copied to clipboard!
    </Alert>
  </Snackbar>
);

export default SuccessfulCopySnackbar;
