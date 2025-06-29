import React, { ReactNode } from 'react';

import * as Icons from '@rosen-bridge/icons';
import { styled, SvgIcon, Typography } from '@rosen-bridge/ui-kit';
import { capitalize } from 'lodash-es';

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

const Chip = ({ label, icon, color = 'primary' }: ChipProps) => {
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
export default Chip;