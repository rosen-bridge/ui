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
  console.log('Received value:', value);

  const [number, decimals] = value.split('.');

  console.log('Extracted number:', number);
  console.log('Extracted decimals:', decimals);
  console.log('Condition (+value):', +value);
  console.log(
    'Formatted output:',
    +value ? number.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '-',
  );

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
          variant={size == 'normal' ? 'body2' : 'body1'}
        >
          {title}
        </Typography>
      )}
      <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
        {loading && (
          <Typography
            color="text.primary"
            variant={size == 'normal' ? 'body1' : 'h2'}
          >
            Pending...
          </Typography>
        )}
        {!loading && (
          <>
            <Typography
              color="text.primary"
              variant={size == 'normal' ? 'body1' : 'h2'}
            >
              {+value ? number.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '-'}
            </Typography>
            {!!+value && (
              <>
                {!!decimals && (
                  <Typography
                    color="text.primary"
                    variant={size == 'normal' ? 'caption' : 'body2'}
                  >
                    .{decimals}
                  </Typography>
                )}
                {unit ? (
                  <Typography
                    color="text.secondary"
                    variant={size == 'normal' ? 'caption' : 'body2'}
                  >
                    {unit ? `\u00A0${unit}` : ''}
                  </Typography>
                ) : null}
              </>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};
