import { SyncExclamation } from '@rosen-bridge/icons';
import {
  Button,
  CircularProgress,
  DividerNew,
  Grid,
  IconButton,
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
    <Grid
      container
      alignItems="center"
      justifyContent="space-between"
      wrap="nowrap"
      width="auto"
      gap={1.5}
    >
      <Grid item alignSelf="stretch">
        <DividerNew orientation="vertical" />
      </Grid>
      <Grid item>
        {loading && (
          <CircularProgress
            size={24}
            sx={{
              margin: (theme) => theme.spacing(1),
              verticalAlign: 'middle',
            }}
          />
        )}
        {!error && !loading && (
          <Button
            sx={{ whiteSpace: 'nowrap' }}
            disabled={disabled}
            onClick={onClick}
          >
            <span>
              Use all
              <br />
              {value} <small style={{ textTransform: 'none' }}>{unit}</small>
            </span>
          </Button>
        )}
        {error && !loading && (
          <IconButton sx={{ verticalAlign: 'middle' }} onClick={onRetry}>
            <SvgIcon color="error" sx={{ width: 24 }}>
              <SyncExclamation />
            </SvgIcon>
          </IconButton>
        )}
      </Grid>
    </Grid>
  );
};
