import { SyncExclamation } from '@rosen-bridge/icons';
import {
  Button,
  CircularProgress,
  DividerNew,
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
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      flexWrap="nowrap"
      width="auto"
      gap={1.5}
    >
      <DividerNew orientation="vertical" style={{ alignSelf: 'stretch' }} />

      <Stack direction="row" alignItems="center">
        {loading && (
          <CircularProgress
            size={24}
            style={{
              margin: '8px',
              verticalAlign: 'middle',
            }}
          />
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
          <IconButton style={{ verticalAlign: 'middle' }} onClick={onRetry}>
            <SvgIcon color="error" style={{ width: 24 }}>
              <SyncExclamation />
            </SvgIcon>
          </IconButton>
        )}
      </Stack>
    </Stack>
  );
};
