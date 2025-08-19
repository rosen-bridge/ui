'use client';

import React from 'react';

import {
  ShieldCheck,
  ExclamationOctagon,
  CloseCircle,
  ExclamationTriangleFill,
} from '@rosen-bridge/icons';
import {
  Skeleton,
  styled,
  SvgIcon,
  Tooltip,
  Typography,
} from '@rosen-bridge/ui-kit';

export type StatusType = 'ok' | 'unstable' | 'broken';

export type VariantColor = 'success' | 'warning' | 'error';

/**
 * Props for the Status component.
 */
export interface StatusProps {
  /**
   * The StatusType variant to display.
   * Possible values: 'ok', 'unstable', 'broken'.
   */
  variant?: StatusType;

  /**
   * Additional details shown as a tooltip on hover.
   */
  details?: string;

  /**
   * If true, the component displays a loading skeleton instead of content.
   */
  isLoading?: boolean;
}

const Variants: Record<
  StatusType,
  { status: string; Icon: React.ElementType; color: VariantColor }
> = {
  ok: { status: 'OK', Icon: ShieldCheck, color: 'success' },
  unstable: { status: 'UNSTABLE', Icon: ExclamationOctagon, color: 'warning' },
  broken: { status: 'BROKEN', Icon: CloseCircle, color: 'error' },
};

type RootProps =
  | { isSkeleton: true }
  | { isSkeleton?: false; color: VariantColor };

const Root = styled('div')<RootProps>(({ theme, color, isSkeleton }) => ({
  display: 'flex',
  position: 'relative',
  width: '100%',
  minHeight: '232px',
  height: '100%',
  flexDirection: 'column',
  justifyContent: 'space-between',
  backgroundColor: isSkeleton
    ? theme.palette.background.paper
    : theme.palette[color].light,
  alignItems: 'center',
  padding: theme.spacing(2, 3),
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  [theme.breakpoints.down('laptop')]: {
    height: 'auto',
    minHeight: 'auto',
    flexDirection: 'row-reverse',
    padding: theme.spacing(2),
  },
}));

const Item = styled('div')(({ theme }) => ({
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

const StatusSkeleton = () => {
  return (
    <Root isSkeleton>
      <Skeleton
        variant="circular"
        width={24}
        height={24}
        sx={{ marginLeft: 'auto', zIndex: 20 }}
      />

      <Skeleton
        variant="circular"
        width={184}
        height={184}
        sx={(theme) => ({
          position: 'absolute',
          top: 0,
          zIndex: 10,
          marginTop: '-80px',
          marginLeft: '-6px',
        })}
      />

      <Item>
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton variant="text" width={80} height={24} />
        <Skeleton variant="text" width={60} height={32} />
      </Item>
    </Root>
  );
};

/**
 * Displays a health status with corresponding icon and text based on the variant.
 *
 * When `isLoading` is true, a skeleton placeholder is shown instead.
 *
 * @param {StatusProps} props - Component props
 *
 * @returns JSX.Element
 *
 * @example
 * ```tsx
 * <Status variant="ok" details="System is healthy" />
 * <Status variant="broken" details="System failure detected" isLoading={false} />
 * <Status isLoading />
 * ```
 */
export const Status = ({ variant, details, isLoading }: StatusProps) => {
  if (isLoading) return <StatusSkeleton />;

  /**
   * Ensures a valid variant is used by falling back to 'broken'
   * if the provided variant is not recognized.
   */
  const safeVariant = Variants[variant as StatusType] || Variants['broken'];
  const { status, Icon, color } = safeVariant;

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
        sx={(theme) => ({
          zIndex: 10,
          marginTop: '-60px',
          width: '184px',
          height: '184px',
          position: 'absolute',
          color: theme.palette[color].dark,
          [theme.breakpoints.down('laptop')]: {
            marginTop: '-40px',
          },
          opacity: 0.2,
        })}
      >
        <Icon />
      </SvgIcon>

      <Item>
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

