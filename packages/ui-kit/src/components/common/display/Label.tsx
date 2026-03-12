import { HTMLAttributes } from 'react';

import { Box, Typography } from '@mui/material';

import { Icon } from '../../icon';
import { Stack } from '../../stack';
import { Tooltip } from '../../tooltip';
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
      direction="row"
      justify="start"
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
        align={orientation === 'vertical' ? 'start' : 'center'}
        direction={orientation === 'vertical' ? 'column' : 'row'}
        spacing={orientation === 'vertical' ? 0 : 2}
        style={{
          padding: `${dense ? 0 : 4}px 0`,
          overflow: 'hidden',
          flexGrow: 1,
        }}
      >
        <Stack
          className="rosen-label-label"
          spacing={1}
          direction="row"
          align="center"
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
              <Icon
                color={
                  color === 'textSecondary' ? 'text-secondary' : 'text-primary'
                }
                name="ExclamationCircle"
                size="16px"
                style={{ cursor: 'pointer' }}
              />
            </Tooltip>
          )}
        </Stack>
        <Stack
          direction="row"
          style={{
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            maxWidth: '100%',
            height: orientation === 'vertical' ? '2em' : 'unset',
            flexGrow: orientation === 'vertical' ? 0 : 1,
            alignSelf: orientation === 'vertical' ? 'stretch' : 'center',
            justifyContent: orientation === 'vertical' ? 'start' : 'end',
          }}
          align="center"
        >
          {children}
        </Stack>
      </Stack>
    </Stack>
  );
};

export const Label = InjectOverrides(LabelBase);
