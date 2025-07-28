import React, { ReactNode, useMemo } from 'react';

import * as Icons from '@rosen-bridge/icons';
import { capitalize } from 'lodash-es';

import { styled } from '../../styling';
import { SvgIcon, Typography } from '../base';

/**
 * Props for the Chip component.
 *
 * @property label - The text label displayed inside the chip.
 * @property icon - Optional icon shown before the label. Can be a key from Icons or a custom ReactNode.
 * @property color - Optional theme color for the chip. Defaults to 'primary'.
 */
interface ChipProps {
  label: string;
  icon?: keyof typeof Icons | ReactNode;
  color?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'error'
    | 'neutral'
    | 'info';
}

/** Type guard for safer icon check */
const isIconKey = (icon: unknown): icon is keyof typeof Icons =>
  typeof icon === 'string' && icon in Icons;

const ChipWrapper = styled('button')<{ color: ChipProps['color'] }>(({
  theme,
  color = 'primary',
}) => {
  const palette = theme.palette || theme;
  const colors = palette[color] || palette.primary;

  return {
    'display': 'inline-flex',
    'alignItems': 'center',
    'padding': theme.spacing(0.5, 1),
    'borderRadius': '16px',
    'backgroundColor': colors.light,
    'color': colors.dark,
    'border': 'none',
    'cursor': 'default',
    '& svg': {
      fill: colors.dark,
    },
    '& p': {
      color: colors.dark,
    },
  };
});

/**
 * A simple Chip component that displays a label with an optional icon.
 * Can be styled with different theme colors.
 */
export const Chip = ({ label, icon, color = 'primary' }: ChipProps) => {
  const RenderedIcon = useMemo(() => {
    if (isIconKey(icon)) {
      const IconComponent = Icons[icon];
      return (
        <SvgIcon sx={{ mr: 0.5 }}>
          <IconComponent />
        </SvgIcon>
      );
    }

    if (React.isValidElement(icon)) {
      return <SvgIcon sx={{ mr: 0.5 }}>{icon}</SvgIcon>;
    }

    return null;
  }, [icon]);

  return (
    <ChipWrapper color={color}>
      {RenderedIcon}
      <Typography variant="body2">{capitalize(label)}</Typography>
    </ChipWrapper>
  );
};
