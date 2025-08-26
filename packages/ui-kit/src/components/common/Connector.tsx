import { ReactNode } from 'react';

import { ArrowRight } from '@rosen-bridge/icons';

import { styled } from '../../styling';
import { SvgIcon } from '../base';

/**
 * Props for the Connector component.
 *
 * @property start - The element to render on the left side (e.g. a label or icon).
 * @property end - The element to render on the right side (e.g. a label or icon).
 * @property variant - Visual style of the connector. Can be 'standard' (transparent)
 * or 'filled' (with background). Default is 'standard'.
 */
export interface ConnectorProps {
  start: ReactNode;
  end: ReactNode;
  variant?: 'standard' | 'filled';
}

const ConnectorWrapper = styled('div')<Pick<ConnectorProps, 'variant'>>(
  ({ theme, variant }) => ({
    display: 'inline-flex',
    backgroundColor:
      variant === 'filled' ? theme.palette.neutral.light : 'transparent',
    padding: theme.spacing(0.5),
    borderRadius: theme.spacing(4),
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: 'inherit',
  }),
);

/**
 * A UI component that visually connects two elements with an arrow.
 * It renders a horizontal container with a start element, an arrow icon,
 * and an end element. Useful for showing transitions, mappings, or flows.
 *
 * Example:
 * ```
 * <Connector
 *   start={<Network name={'bitcoin'} /> OR <span>Source</span>}
 *   end={<Network name={'ethereum'} /> OR <span>Destination</span>}
 *   variant="filled"
 * />
 * ```
 */
export const Connector = ({ start, end, variant }: ConnectorProps) => {
  return (
    <ConnectorWrapper variant={variant}>
      {start}
      <SvgIcon sx={{ color: 'text.secondary' }}>
        <ArrowRight />
      </SvgIcon>
      {end}
    </ConnectorWrapper>
  );
};
