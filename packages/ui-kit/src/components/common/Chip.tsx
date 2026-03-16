import { ComponentProps, forwardRef, HtmlHTMLAttributes, useMemo } from 'react';

import { Skeleton2 } from '@/components';

import { styled } from '../../styling';
import { Typography } from '../base';
import { Icon, IconProps } from '../icon';
import { InjectOverrides } from './InjectOverrides';

/**
 * Props for the Chip component.
 *
 * @property label - Optional text label displayed inside the chip.
 * If not provided (and not loading), `"invalid"` will be shown.
 *
 * @property icon - Optional icon shown before the label.
 * Can be:
 * - A string key from `@rosen-bridge/icons`.
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
  icon?: IconProps['name'];
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
  const { label, icon, children, color = 'primary', loading, ...rest } = props;

  const RenderedIcon = useMemo(() => {
    if (!icon) return null;
    return <Icon name={icon} style={{ marginRight: '4px' }} />;
  }, [icon]);

  const hasContent = !!children || !!label;

  const content = hasContent
    ? (children ?? <Typography variant="body2">{label}</Typography>)
    : 'Invalid';

  return (
    <ChipWrapper color={color} ref={ref} {...rest}>
      {RenderedIcon}
      {content}
      {loading && <Skeleton2 attached variant="circular" />}
    </ChipWrapper>
  );
});

ChipBase.displayName = 'Chip';

export const Chip = InjectOverrides(ChipBase);

export type ChipProps = ComponentProps<typeof Chip>;
