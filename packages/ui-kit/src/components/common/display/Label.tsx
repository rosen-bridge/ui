import { HTMLAttributes } from 'react';

import { Box, SvgIcon, Typography } from '@mui/material';
import { ExclamationCircle } from '@rosen-bridge/icons';

import { Stack, Tooltip } from '../../base';
import { InjectOverrides } from '../InjectOverrides';

/**
 * Props for the `Label` component.
 */
export type LabelProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * The color of the label text.
   * - `textSecondary` (default)
   * - `textPrimary`
   */
  color?: 'textSecondary' | 'textPrimary';

  /**
   * Reduces vertical padding for a denser layout.
   */
  dense?: boolean;

  /**
   * An optional info text to display in a tooltip.
   * If provided, an info icon will appear next to the label.
   */
  info?: string;

  /**
   * When true, renders the label with an "inset" style,
   * showing a dashed border indicator on the left.
   */
  inset?: boolean;

  /**
   * The text to be displayed as the main label.
   */
  label: string;

  /**
   * Layout orientation of the label and content.
   * - `horizontal`: label and content are side by side.
   * - `vertical`: label is placed above the content.
   */
  orientation?: 'horizontal' | 'vertical';
};

/**
 * A reusable label component that supports optional tooltip info,
 * orientation (horizontal or vertical), inset styling, and dense layout.
 *
 * Useful for form-like UIs where labels and values need consistent styling.
 */
const LabelBase = ({
  children,
  color = 'textSecondary',
  className,
  dense,
  info,
  inset,
  label,
  orientation = 'horizontal',
  ...props
}: LabelProps) => {
  return (
    <Stack
      className={`rosen-label rosen-label-${orientation} ${className || ''}`}
      flexDirection="row"
      justifyContent="start"
      {...props}
    >
      {inset && (
        <Box
          className="rosen-label-inset"
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
      )}
      <Stack
        className="rosen-label-container"
        alignItems={orientation === 'vertical' ? 'start' : 'center'}
        flexDirection={orientation === 'vertical' ? 'column' : 'row'}
        gap={orientation === 'vertical' ? 0 : 2}
        py={dense ? 0 : 0.5}
        overflow="hidden"
        flexGrow={1}
      >
        <Stack
          className="rosen-label-label"
          gap={1}
          flexDirection="row"
          alignItems="center"
        >
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
        <Stack
          flexDirection="row"
          overflow="hidden"
          whiteSpace="nowrap"
          maxWidth="100%"
          height={orientation === 'vertical' ? '2em' : 'unset'}
          display="flex"
          alignItems="center"
          flexGrow={orientation === 'vertical' ? 0 : 1}
          alignSelf={orientation === 'vertical' ? 'stretch' : 'center'}
          justifyContent={orientation === 'vertical' ? 'start' : 'end'}
        >
          {children}
        </Stack>
      </Stack>
    </Stack>
  );
};

export const Label = InjectOverrides(LabelBase);
