import { Button, Divider, Icon, IconButton, Stack } from '@rosen-bridge/ui-kit';

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
      {!error && (
        <Button disabled={disabled} loading={loading} onClick={onClick}>
          <span style={{ whiteSpace: 'nowrap' }}>
            Use all
            <br />
            {value} <small style={{ textTransform: 'none' }}>{unit}</small>
          </span>
        </Button>
      )}
      {error && !loading && (
        <IconButton onClick={onRetry}>
          <Icon color="error" name="SyncExclamation" />
        </IconButton>
      )}
    </Stack>
  );
};
