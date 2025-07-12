'use client';

import React from 'react';

import {
  ShieldCheck,
  ExclamationOctagon,
  CloseCircle,
  ExclamationTriangleFill,
} from '@rosen-bridge/icons';
import { styled, SvgIcon, Tooltip, Typography } from '@rosen-bridge/ui-kit';

export type Status = 'ok' | 'unstable' | 'broken';

export type StatusProps = {
  variant: Status;
  details: string;
};

export type VariantColor = 'success' | 'warning' | 'error';

export type ColorProps = {
  color: VariantColor;
};

const Variants: Record<
  Status,
  { status: string; Icon: React.ElementType; color: VariantColor }
> = {
  ok: {
    status: 'OK',
    Icon: ShieldCheck,
    color: 'success',
  },
  unstable: {
    status: 'UNSTABLE',
    Icon: ExclamationOctagon,
    color: 'warning',
  },
  broken: {
    status: 'BROKEN',
    Icon: CloseCircle,
    color: 'error',
  },
};

const Root = styled('div')<ColorProps>(({ theme, color }) => ({
  display: 'flex',
  position: 'relative',
  width: '100%',
  minHeight: '232px',
  height: '100%',
  flexDirection: 'column',
  justifyContent: 'space-between',
  backgroundColor: theme.palette[color].light,
  alignItems: 'center',
  padding: theme.spacing(2, 3),
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  [theme.breakpoints.down('laptop')]: {
    height: 'auto',
    flexDirection: 'row-reverse',
    padding: theme.spacing(2),
  },
}));

const Item = styled('div')<ColorProps>(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifySelf: 'self-end',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1),
  [theme.breakpoints.down('laptop')]: {
    flexDirection: 'row',
  },
}));

const Status = ({ variant, details }: StatusProps) => {
  const { status, Icon, color } = Variants[variant];

  return (
    <Root color={color}>
      <Tooltip
        sx={{
          'zIndex': 20,
          'marginLeft': 'auto',
          'display': 'flex',
          'cursor': 'pointer',
          '& > svg': {
            color: (theme) => theme.palette[color].dark,
          },
        }}
        title={details}
      >
        <SvgIcon>
          <ExclamationTriangleFill />
        </SvgIcon>
      </Tooltip>

      <SvgIcon
        sx={{
          zIndex: 10,
          marginTop: '-60px',
          width: '184px',
          height: '184px',
          position: 'absolute',
          color: (theme) => theme.palette[color].dark,
          opacity: 0.2,
        }}
      >
        <Icon />
      </SvgIcon>

      <Item color={color}>
        <SvgIcon
          width={32}
          height={32}
          sx={{
            'color': (theme) => theme.palette[color].main,
            '@media (max-width: 768px)': {
              color: (theme) => theme.palette[color].dark,
            },
          }}
        >
          <Icon />
        </SvgIcon>

        <Typography
          variant="body1"
          sx={{
            'color': (theme) => theme.palette[color].main,
            '@media (max-width: 768px)': {
              fontSize: '20px',
              fontWeight: 700,
              color: (theme) => theme.palette[color].dark,
            },
          }}
        >
          Health is
        </Typography>

        <Typography
          variant="h3"
          sx={{
            'fontWeight': 'bold',
            'color': (theme) => theme.palette[color].dark,
            '@media (max-width: 768px)': {
              fontSize: '20px',
              fontWeight: 700,
              color: (theme) => theme.palette[color].dark,
            },
          }}
        >
          {status}
        </Typography>
      </Item>
    </Root>
  );
};

export default Status;
