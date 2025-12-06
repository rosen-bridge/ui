import React, {
  ComponentProps,
  forwardRef,
  HtmlHTMLAttributes,
  ReactNode,
  useMemo,
} from 'react';

import * as Icons from '@rosen-bridge/icons';

import { styled } from '../../styling';
import { Typography, Skeleton } from '../base';
import { InjectOverrides } from './InjectOverrides';
import { SvgIcon } from './SvgIcon';

/**
 * Props for the Chip component.
 *
 * @property label - Optional text label displayed inside the chip.
 * If not provided (and not loading), `"invalid"` will be shown.
 *
 * @property icon - Optional icon shown before the label.
 * Can be:
 * - A string key from `@rosen-bridge/icons`.
 * - A custom `ReactNode` (e.g., a custom `<svg />`).
 *
 * @property color - Optional theme color for the chip.
 * Defaults to `"primary"`. Supports:
 * `"primary" | "secondary" | "success" | "warning" | "error" | "neutral" | "info"`.
 *
 * @property loading - When true, displays a skeleton placeholder
 * instead of the actual chip content.
 */
type ChipBaseProps = HtmlHTMLAttributes<HTMLDivElement> & {
  label?: string;
  icon?: keyof typeof Icons | ReactNode;
  color?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'error'
    | 'neutral'
    | 'info';
  loading?: boolean;
};

/** Type guard for safer icon check */
const isIconKey = (icon: unknown): icon is keyof typeof Icons =>
  typeof icon === 'string' && icon in Icons;

const ChipWrapper = styled('div')<ChipBaseProps>(({
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
 * A small, pill-shaped UI component that displays a label
 * with an optional icon.
 *
 * - If `loading` is true, it shows a skeleton placeholder.
 * - If no `label` is provided (and not loading), it renders `"invalid"`.
 * - Supports both built-in icons from `@rosen-bridge/icons` and custom React nodes.
 * - Can be styled with different theme colors via the `color` prop.
 *
 * @example
 * ```tsx
 * <Chip label="Active" color="success" icon="Check" />
 * <Chip label="Pending" color="warning" loading />
 * ```
 */
const ChipBase = forwardRef<HTMLDivElement, ChipBaseProps>((props, ref) => {
  const { label, icon, color = 'primary', loading } = props;

  const RenderedIcon = useMemo(() => {
    if (!icon) return null;

    if (isIconKey(icon)) {
      const IconComponent = Icons[icon];
      return (
        <SvgIcon style={{ marginRight: '4px' }}>
          <IconComponent />
        </SvgIcon>
      );
    }

    if (React.isValidElement(icon)) {
      return <SvgIcon style={{ marginRight: '4px' }}>{icon}</SvgIcon>;
    }

    return null;
  }, [icon]);

  if (loading) {
    return <Skeleton width={80} height={32} variant="rounded" />;
  }

  return (
    <ChipWrapper color={color} ref={ref}>
      {RenderedIcon}
      <Typography variant="body2">{label ? label : 'Invalid'}</Typography>
    </ChipWrapper>
  );
});

ChipBase.displayName = 'Chip';

export const Chip = InjectOverrides(ChipBase);

export type ChipProps = ComponentProps<typeof Chip>;
