import { ReactNode } from 'react';

import { Icon, IconProps } from '@/components';
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
    icon?: IconProps;
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

export type ConnectorProps = OverridableType<
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
}: ConnectorProps) => {
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
