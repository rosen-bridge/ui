import { Collapsible as CollapsibleBaseUI } from '@base-ui/react/collapsible';

import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

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

export const Collapsible = (props: CollapsibleProps) => {
  const { children, ...rest } = useConfig('Collapsible', props);

  return (
    <CollapsibleBaseUI.Root {...rest}>
      <CollapsibleBaseUI.Panel className="RosenCollapsible-panel">
        {children}
      </CollapsibleBaseUI.Panel>
    </CollapsibleBaseUI.Root>
  );
};

Collapsible.displayName = 'Collapsible';
