import type { ReactNode } from 'react';

import { Icon, type IconProps } from '@/components';
import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

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
export const Connector = (props: ConnectorProps) => {
  const {
    end,
    slots,
    start,
    variant = 'standard',
    ...rest
  } = useConfig('Connector', props);

  return (
    <div data-variant={variant} {...rest}>
      {start}
      <Icon name="ArrowRight" {...slots?.icon} />
      {end}
    </div>
  );
};

Connector.displayName = 'Connector';
