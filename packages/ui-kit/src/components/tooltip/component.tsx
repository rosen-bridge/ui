import {
  Children,
  cloneElement,
  ComponentProps,
  ReactElement,
  ReactNode,
  useMemo,
} from 'react';

import { mergeProps } from '@base-ui/react/merge-props';
import { Tooltip as TooltipBaseUI } from '@base-ui/react/tooltip';

import { OverridableType } from '@/types';
import { ElementBaseProps, Wrap } from '@/core';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TooltipOverrides {}

export type TooltipOwnProps = {
  children: ReactElement;
  disabled?: boolean;
  title?: ReactNode;
};

export type TooltipBaseProps = ElementBaseProps<'div', TooltipOwnProps>;

export type TooltipOverriddenProps = OverridableType<
  TooltipBaseProps,
  TooltipOverrides,
  never
>;

export const TooltipBase = ({
  children,
  disabled,
  title,
  ...rest
}: TooltipOverriddenProps) => {
  const child = useMemo(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    () => Children.only(children) as ReactElement<any, any>,
    [children],
  );

  if (disabled) return children;

  if (!title) return children;

  return (
    <>
      <TooltipBaseUI.Provider>
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

TooltipBase.displayName = 'Tooltip';

export const Tooltip = Wrap(TooltipBase);

export type TooltipProps = ComponentProps<typeof Tooltip>;
