import { Box, Typography } from '../base';

export interface AmountProps {
  value: string;
  loading?: boolean;
  size?: 'normal' | 'large';
  title?: string;
  unit?: string;
}

/**
 * Displays an amount value along with its title and unit, if available
 */
export const Amount = ({
  value,
  loading,
  size = 'normal',
  title,
  unit,
}: AmountProps) => {
  const [number, decimals] = value.split('.');
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {!!title && (
        <Typography
          color="text.secondary"
          sx={{ fontSize: size == 'normal' ? '0.75rem' : '1rem' }}
        >
          {title}
        </Typography>
      )}
      <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
        {loading && (
          <Typography
            color="text.primary"
            sx={{ fontSize: size == 'normal' ? '1rem' : '1.5rem' }}
          >
            Pending...
          </Typography>
        )}
        {!loading && (
          <>
            <Typography
              color="text.primary"
              sx={{ fontSize: size == 'normal' ? '0.75rem' : '1.5rem' }}
            >
              {+value ? number.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '-'}
            </Typography>
            {!!+value && (
              <>
                {!!decimals && (
                  <Typography
                    color="text.secondary"
                    sx={{ fontSize: size == 'normal' ? '0.75em' : '1.125rem' }}
                  >
                    .{decimals}
                  </Typography>
                )}
                {!!unit && (
                  <Typography
                    color="text.secondary"
                    sx={{ fontSize: size == 'normal' ? '0.75em' : '1.125rem' }}
                  >
                    &nbsp;{unit}
                  </Typography>
                )}
              </>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};
