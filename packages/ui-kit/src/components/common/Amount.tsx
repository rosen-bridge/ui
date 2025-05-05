import { Box, Typography } from '../base';

export interface AmountProps {
  value?: bigint | number | string;
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
  let number: string | undefined;

  let decimals: string | undefined;

  switch (typeof value) {
    case 'bigint': {
      number = value.toLocaleString();
      decimals = '0';

      break;
    }

    case 'number': {
      const sections = value
        .toLocaleString('fullwide', {
          minimumFractionDigits: 1,
          maximumFractionDigits: 20,
        })
        .split('.');

      number = sections.at(0);
      decimals = sections.at(1) || '0';

      break;
    }

    case 'string': {
      const sections = value.split('.');

      number = sections.at(0)!.toLocaleString();
      decimals = sections.at(1) || '0';

      break;
    }
  }

  return (
    <Box
      sx={{
        display: title ? 'flex' : 'inline-flex',
        alignItems: 'baseline',
      }}
    >
      {!!title && (
        <Typography
          sx={{
            opacity: 0.6,
            flexGrow: 1,
            fontSize: size == 'normal' ? '0.75rem' : '1rem',
          }}
        >
          {title}
        </Typography>
      )}
      {loading && (
        <Typography
          sx={{ fontSize: size == 'normal' ? '0.75rem' : '1.375rem' }}
        >
          Pending...
        </Typography>
      )}
      {!loading && (
        <Typography
          sx={{ fontSize: size == 'normal' ? '0.75rem' : '1.375rem' }}
        >
          {number || '-'}
        </Typography>
      )}
      {!loading && !!decimals && (
        <Typography
          sx={{
            opacity: 0.6,
            fontSize:
              size == 'normal' ? 'calc(0.75rem * 0.75)' : 'calc(1.5rem * 0.75)',
          }}
        >
          .{decimals}
        </Typography>
      )}
      {!loading && !!unit && !!number && (
        <Typography
          sx={{
            opacity: 0.6,
            fontSize:
              size == 'normal' ? 'calc(0.75rem * 0.75)' : 'calc(1.5rem * 0.75)',
          }}
        >
          &nbsp;{unit}
        </Typography>
      )}
    </Box>
  );
};
