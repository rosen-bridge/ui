import { ReactNode } from 'react';

import { Box, Typography } from '@mui/material';
import { ExclamationCircle } from '@rosen-bridge/icons';

import { Stack, SvgIcon, Tooltip } from '../../base';

/**
 * Props for the `Label` component.
 */
type LabelProps = {
  /**
   * The text to be displayed as the main label.
   */
  label: string;

  /**
   * Optional child content displayed next to or below the label,
   * depending on the orientation.
   */
  children?: ReactNode;

  /**
   * When true, renders the label with an "inset" style,
   * showing a dashed border indicator on the left.
   */
  inset?: boolean;

  /**
   * An optional info text to display in a tooltip.
   * If provided, an info icon will appear next to the label.
   */
  info?: string;

  /**
   * Reduces vertical padding for a denser layout.
   */
  dense?: boolean;

  /**
   * Layout orientation of the label and content.
   * - `horizontal`: label and content are side by side.
   * - `vertical`: label is placed above the content.
   */
  orientation?: 'horizontal' | 'vertical';

  /**
   * The color of the label text.
   * - `textSecondary` (default)
   * - `textPrimary`
   */
  color?: 'textSecondary' | 'textPrimary';
};

/**
 * A reusable label component that supports optional tooltip info,
 * orientation (horizontal or vertical), inset styling, and dense layout.
 *
 * Useful for form-like UIs where labels and values need consistent styling.
 */
export const Label = ({
  label,
  children,
  dense,
  inset,
  info,
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
        <Stack gap={1} flexDirection="row" alignItems="center">
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
          {info && (
            <Tooltip arrow title={info}>
              <SvgIcon
                sx={{
                  width: '16px',
                  height: '16px',
                  cursor: 'pointer',
                  color: (theme) =>
                    color === 'textSecondary'
                      ? theme.palette.text.secondary
                      : theme.palette.text.primary,
                }}
              >
                <ExclamationCircle />
              </SvgIcon>
            </Tooltip>
          )}
        </Stack>
      </Box>
      <Box overflow="hidden" whiteSpace="nowrap" maxWidth="100%" height="2em">
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
