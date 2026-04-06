import { ComponentProps, ReactNode } from 'react';

import { Icon, IconOverriddenProps } from '@/components';
import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ConnectorOverrides {}

export type ConnectorOwnProps = {
  /**
   * The element to render on the right side (e.g. a label or icon).
   */
  end: ReactNode;

  slots?: {
    icon?: IconOverriddenProps;
  };

  /**
   * The element to render on the left side (e.g. a label or icon).
   */
  start: ReactNode;

  /**
   * Visual style of the connector. Can be 'standard' (transparent) or 'filled' (with background). Default is 'standard'.
   */
  variant?: 'standard' | 'filled';
};

export type ConnectorBaseProps = ElementBaseProps<'div', ConnectorOwnProps>;

export type ConnectorOverriddenProps = OverridableType<
  ConnectorBaseProps,
  ConnectorOverrides,
  never
>;

/**
 * Connector component: visually connects two elements with an arrow.
 */
export const ConnectorBase = ({
  end,
  slots,
  start,
  variant = 'standard',
  ...rest
}: ConnectorOverriddenProps) => {
  return (
    <div data-variant={variant} {...rest}>
      {start}
      <Icon name="ArrowRight" {...slots?.icon} />
      {end}
    </div>
  );
};

ConnectorBase.displayName = 'Connector';

export const Connector = Wrap(ConnectorBase);

export type ConnectorProps = ComponentProps<typeof Connector>;
