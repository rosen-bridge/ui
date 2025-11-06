import { SyncExclamation } from '@rosen-bridge/icons';
import {
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  SvgIcon,
} from '@rosen-bridge/ui-kit';

export interface UseAllAmountProps {
  disabled: boolean;
  error: boolean;
  loading: boolean;
  value: string;
  unit: string;
  onClick: () => void;
  onRetry: () => void;
}

export const UseAllAmount = ({
  disabled,
  error,
  loading,
  value,
  unit,
  onClick,
  onRetry,
}: UseAllAmountProps) => {
  return (
    <Stack direction="row" align="center" justify="between" spacing={1.5}>
      <Divider
        orientation="vertical"
        style={{ alignSelf: 'stretch', height: 'auto' }}
      />
      {loading && (
        <IconButton disabled>
          <CircularProgress size={24} />
        </IconButton>
      )}
      {!error && !loading && (
        <Button disabled={disabled} onClick={onClick}>
          <span style={{ whiteSpace: 'nowrap' }}>
            Use all
            <br />
            {value} <small style={{ textTransform: 'none' }}>{unit}</small>
          </span>
        </Button>
      )}
      {error && !loading && (
        <IconButton onClick={onRetry}>
          <SvgIcon color="error">
            <SyncExclamation />
          </SvgIcon>
        </IconButton>
      )}
    </Stack>
  );
};
