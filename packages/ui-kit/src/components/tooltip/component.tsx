import { cloneElement, ComponentProps, ReactElement, ReactNode } from 'react';

import { Tooltip as TooltipBaseUI } from '@base-ui/react/tooltip';

import { OverridableType } from '@/@types';
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
  if (disabled) return children;

  if (!title) return children;

  return (
    <>
      <TooltipBaseUI.Provider>
        <TooltipBaseUI.Root>
          <TooltipBaseUI.Trigger
            render={(props) => cloneElement(children, props)}
          />
          <TooltipBaseUI.Portal>
            <TooltipBaseUI.Positioner sideOffset={10}>
              <TooltipBaseUI.Popup className="rosen-Tooltip" {...rest}>
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
