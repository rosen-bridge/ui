import { cloneElement, ComponentProps, ReactNode } from 'react';

import { Tooltip as TooltipBaseUi } from '@base-ui/react/tooltip';

import './styles.scss';

import { OverridableType } from '@/@types';
import { ElementBaseProps, Wrap } from '@/core';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TooltipOverrides { }

export type TooltipOwnProps = {
  children: React.ReactElement<unknown, any>;
  disabled?: boolean;
  placement?: 'auto' | 'auto-start' | 'auto-end' | 'top' | 'bottom' | 'right' | 'left' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'right-start' | 'right-end' | 'left-start' | 'left-end';
  title?: ReactNode;
}

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
      <TooltipBaseUi.Provider>
        <TooltipBaseUi.Root>
          <TooltipBaseUi.Trigger render={(props) => cloneElement(children, props)} />
          <TooltipBaseUi.Portal>
            <TooltipBaseUi.Positioner sideOffset={10}>
              <TooltipBaseUi.Popup className="rosen-Tooltip">
                {title}
              </TooltipBaseUi.Popup>
            </TooltipBaseUi.Positioner>
          </TooltipBaseUi.Portal>
        </TooltipBaseUi.Root>
      </TooltipBaseUi.Provider>
    </>
  );
};

TooltipBase.displayName = 'Tooltip';

export const Tooltip = Wrap(TooltipBase);

export type TooltipProps = ComponentProps<typeof Tooltip>;
