import { ComponentProps, forwardRef, HTMLAttributes, ReactNode } from 'react';

import { ArrowRight } from '@rosen-bridge/icons';

import { styled } from '../../styling';
import { InjectOverrides } from './InjectOverrides';
import { SvgIcon } from './SvgIcon';

/**
 * Props for the Connector component.
 *
 * @property start - The element to render on the left side (e.g. a label or icon).
 * @property end - The element to render on the right side (e.g. a label or icon).
 * @property variant - Visual style of the connector. Can be 'standard' (transparent)
 * or 'filled' (with background). Default is 'standard'.
 */
type ConnectorBaseProps = HTMLAttributes<HTMLDivElement> & {
  start: ReactNode;
  end: ReactNode;
  variant?: 'standard' | 'filled';
};

const Root = styled('div')<Pick<ConnectorBaseProps, 'variant'>>(
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
 * Connector component: visually connects two elements with an arrow.
 *
 * Props:
 * - start: left element (label or icon)
 * - end: right element (label or icon)
 * - variant: 'standard' (transparent) or 'filled' (with background)
 */
const ConnectorBase = forwardRef<HTMLDivElement, ConnectorBaseProps>(
  (props, ref) => {
    const { start, end, variant, ...rest } = props;
    return (
      <Root ref={ref} variant={variant} {...rest}>
        {start}
        <SvgIcon color="text.secondary">
          <ArrowRight />
        </SvgIcon>
        {end}
      </Root>
    );
  },
);

ConnectorBase.displayName = 'Connector';

export const Connector = InjectOverrides(ConnectorBase);

export type ConnectorProps = ComponentProps<typeof Connector>;
