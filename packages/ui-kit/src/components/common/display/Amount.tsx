import { HTMLAttributes } from 'react';

import { SvgIcon } from '@mui/material';
import { ExclamationTriangle } from '@rosen-bridge/icons';

import { Box, Skeleton, Typography } from '../../base';

export type AmountProps = {
  value?: bigint | number | string;
  loading?: boolean;
  orientation?: 'horizontal' | 'vertical';
  unit?: string;
} & HTMLAttributes<HTMLDivElement>;

/**
 * Displays an amount value along with its unit, if available
 */
export const Amount = ({
  value,
  loading,
  unit,
  orientation = 'horizontal',
}: AmountProps) => {
  const error = value !== undefined && isNaN(Number(value));

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
        display: 'inline-flex',
        flexDirection: orientation === 'vertical' ? 'column' : 'row',
        alignItems: 'baseline',
      }}
    >
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'baseline',
        }}
      >
        {loading && <Skeleton variant="text" width={80} sx={{ mr: 0.5 }} />}
        {!loading && error && (
          <SvgIcon
            fontSize="inherit"
            sx={{
              mr: 0.5,
              transform: 'translateY(20%)',
            }}
          >
            <ExclamationTriangle />
          </SvgIcon>
        )}
        {!loading && !error && (
          <Typography fontSize="inherit" component="span">
            {number || '–'}
          </Typography>
        )}
        {!loading && !error && !!decimals && (
          <Typography
            fontSize="75%"
            component="span"
            sx={{
              opacity: 0.7,
            }}
          >
            .{decimals}&nbsp;
          </Typography>
        )}
      </Box>
      {!!unit && (
        <Typography
          fontSize="75%"
          component="div"
          sx={{
            opacity: 0.7,
          }}
        >
          {unit}
        </Typography>
      )}
    </Box>
  );
};
