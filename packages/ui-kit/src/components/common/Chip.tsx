import React, { ReactNode } from 'react';

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
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';
}

const ChipWrapper = styled('button')<{
  color: ChipProps['color'];
}>(({ theme, color }) => {
  const palette = theme.palette || theme;
  const colors = palette[color || 'primary'];

  return {
    'display': 'inline-flex',
    'alignItems': 'center',
    'padding': theme.spacing(0.5, 1),
    'borderRadius': '16px',
    'backgroundColor': colors.light,
    'color': colors.dark,
    'border': `none`,
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
  let IconNode: ReactNode = null;

  if (typeof icon === 'string' && icon in Icons) {
    const IconComponent = Icons[icon as keyof typeof Icons];
    IconNode = <IconComponent />;
  } else if (React.isValidElement(icon)) {
    IconNode = icon;
  }

  const RenderedIcon = IconNode ? (
    <SvgIcon sx={{ mr: 0.5 }}>{IconNode}</SvgIcon>
  ) : null;

  return (
    <ChipWrapper color={color}>
      {RenderedIcon}
      <Typography variant="body1">{capitalize(label)}</Typography>
    </ChipWrapper>
  );
};
