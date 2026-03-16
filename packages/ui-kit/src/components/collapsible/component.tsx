import { ComponentProps } from 'react';

import { OverridableType } from '@/@types';
import { ElementBaseProps, Root, Wrap } from '@/core';
import { Collapsible as CollapsibleBaseUI } from '@base-ui/react/collapsible';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CollapsibleOverrides { }

export type CollapsibleOwnProps = {
  open?: boolean;
};

export type CollapsibleBaseProps = ElementBaseProps<'div', CollapsibleOwnProps>;

export type CollapsibleOverriddenProps = OverridableType<
  CollapsibleBaseProps,
  CollapsibleOverrides,
  never
>;

export const CollapsibleBase = ({ children, ...rest }: CollapsibleOverriddenProps) => {
  return (
    <Root as={CollapsibleBaseUI.Root} {...rest}>
      <CollapsibleBaseUI.Panel className="rosen-Collapsible__panel">
        {children}
      </CollapsibleBaseUI.Panel>
    </Root>
  );
};

CollapsibleBase.displayName = 'Collapsible';

export const Collapsible = Wrap(CollapsibleBase);

export type CollapsibleProps = ComponentProps<typeof Collapsible>;
