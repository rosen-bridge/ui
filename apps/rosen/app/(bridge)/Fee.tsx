import { Grid, Typography } from '@rosen-bridge/ui-kit';

export interface FeeProps {
  amount: string;
  loading?: boolean;
  title: string;
  unit: string;
}

export const Fee = ({ amount, loading, title, unit }: FeeProps) => {
  return (
    <Grid container alignItems="center" flexWrap="nowrap">
      <Grid item flexGrow={1}>
        <Typography color="text.secondary" variant="body2">
          {title}
        </Typography>
      </Grid>
      <Grid item>
        <Typography color="text.primary">
          {loading ? 'Pending...' : +amount ? amount : '-'}
        </Typography>
      </Grid>
      <Grid item>
        {!loading && !!+amount && (
          <Typography color="text.secondary" variant="caption">
            &nbsp;{unit}
          </Typography>
        )}
      </Grid>
    </Grid>
  );
};
