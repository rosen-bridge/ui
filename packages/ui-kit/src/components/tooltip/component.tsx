import { ComponentProps } from 'react';

import {
  Tooltip as TooltipMUI,
  TooltipProps as TooltipPropsMUI,
} from '@mui/material';

import { OverridableType } from '@/@types';
import { ElementBaseProps, Wrap } from '@/core';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TooltipOverrides {}

export type TooltipOwnProps = Pick<
  TooltipPropsMUI,
  'arrow' | 'children' | 'placement' | 'title'
>;

export type TooltipBaseProps = ElementBaseProps<'div', TooltipOwnProps>;

export type TooltipOverriddenProps = OverridableType<
  TooltipBaseProps,
  TooltipOverrides,
  never
>;

export const TooltipBase = ({
  children,
  title,
  ...rest
}: TooltipOverriddenProps) => {
  if (!title) return children;
  return (
    <TooltipMUI title={title} {...rest}>
      {children}
    </TooltipMUI>
  );
};

TooltipBase.displayName = 'Tooltip';

export const Tooltip = Wrap(TooltipBase);

export type TooltipProps = ComponentProps<typeof Tooltip>;
