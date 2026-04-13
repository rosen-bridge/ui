import { Collapsible as CollapsibleBaseUI } from '@base-ui/react/collapsible';

import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CollapsibleOverrides {}

export type CollapsibleOwnProps = {
  open?: boolean;
};

export type CollapsibleBaseProps = ElementBaseProps<'div', CollapsibleOwnProps>;

export type CollapsibleProps = OverridableType<
  CollapsibleBaseProps,
  CollapsibleOverrides,
  never
>;

export const CollapsibleBase = ({ children, ...rest }: CollapsibleProps) => {
  return (
    <CollapsibleBaseUI.Root {...rest}>
      <CollapsibleBaseUI.Panel className="RosenCollapsible-panel">
        {children}
      </CollapsibleBaseUI.Panel>
    </CollapsibleBaseUI.Root>
  );
};

CollapsibleBase.displayName = 'Collapsible';

export const Collapsible = Wrap(CollapsibleBase);
