import {
  Children,
  cloneElement,
  ReactElement,
  ReactNode,
  useMemo,
} from 'react';

import { mergeProps } from '@base-ui/react/merge-props';
import { Tooltip as TooltipBaseUI } from '@base-ui/react/tooltip';

import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TooltipOverrides {}

export type TooltipOwnProps = {
  children: ReactElement;
  disabled?: boolean;
  title?: ReactNode;
};

export type TooltipBaseProps = ElementBaseProps<'div', TooltipOwnProps>;

export type TooltipProps = OverridableType<
  TooltipBaseProps,
  TooltipOverrides,
  never
>;

export const Tooltip = (props: TooltipProps) => {
  const { children, disabled, title, ...rest } = useConfig('Tooltip', props);

  const child = useMemo(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    () => Children.only(children) as ReactElement<any, any>,
    [children],
  );

  if (disabled) return children;

  if (!title) return children;

  return (
    <>
      <TooltipBaseUI.Provider delay={250}>
        <TooltipBaseUI.Root>
          <TooltipBaseUI.Trigger
            render={(props) =>
              cloneElement(children, mergeProps(props, child.props))
            }
          />
          <TooltipBaseUI.Portal>
            <TooltipBaseUI.Positioner
              className="RosenTooltip-positioner"
              positionMethod="fixed"
              sideOffset={8}
            >
              <TooltipBaseUI.Popup className="RosenTooltip" {...rest}>
                {title}
              </TooltipBaseUI.Popup>
            </TooltipBaseUI.Positioner>
          </TooltipBaseUI.Portal>
        </TooltipBaseUI.Root>
      </TooltipBaseUI.Provider>
    </>
  );
};

Tooltip.displayName = 'Tooltip';
