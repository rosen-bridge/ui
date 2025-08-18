import { ReactNode } from 'react';

import { Box, Typography } from '@mui/material';

interface LabelProps {
  label: string;
  children?: ReactNode;
  inset?: boolean;
  dense?: boolean;
  orientation?: 'horizontal' | 'vertical';
  color?: 'textSecondary' | 'textPrimary';
}

export const Label = ({
  label,
  children,
  dense,
  inset,
  orientation,
  color = 'textSecondary',
}: LabelProps) => {
  const content = (
    <Box
      sx={{
        flexGrow: inset ? 1 : 0,
        display: 'flex',
        flexDirection: orientation === 'vertical' ? 'column' : 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: orientation === 'vertical' ? 0 : 1,
        py: dense ? 0 : 0.5,
        overflow: 'hidden',
      }}
    >
      <Box flexShrink={0} flexBasis="40%">
        <Typography
          noWrap
          variant="body2"
          color={color}
          lineHeight="1.5rem"
          sx={{
            my: orientation === 'vertical' ? 0 : 0.5,
          }}
        >
          {label}
        </Typography>
      </Box>
      <Box overflow="hidden" whiteSpace="nowrap" maxWidth="100%">
        {children}
      </Box>
    </Box>
  );

  if (!inset) return content;

  return (
    <Box display="flex" flexDirection="row">
      <Box
        sx={{
          height: 'auto',
          width: 12,
          border: 'dashed',
          borderWidth: '0 0 1px 1px',
          borderBottomLeftRadius: 6,
          borderColor: 'divider',
          transform: 'translateY(-50%)',
          ml: 1,
          mr: 0.5,
          flexShrink: 0,
        }}
      />
      {content}
    </Box>
  );
};
