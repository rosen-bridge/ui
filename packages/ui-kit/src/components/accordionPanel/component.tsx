import { Accordion as AccordionBaseUI } from '@base-ui/react/accordion';

import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

export interface AccordionPanelOverrides {}

export type AccordionPanelOwnProps = {};

export type AccordionPanelBaseProps = ElementBaseProps<'div', AccordionPanelOwnProps>;

export type AccordionPanelProps = OverridableType<
  AccordionPanelBaseProps,
  AccordionPanelOverrides,
  never
>;

export const AccordionPanel = (props: AccordionPanelProps) => {
  const { children, ...rest } = useConfig('AccordionPanel', props);

  return (
    <AccordionBaseUI.Panel {...rest}>
      <div className="RosenAccordionPanel-content">{children}</div>
    </AccordionBaseUI.Panel>
  );
};

AccordionPanel.displayName = 'AccordionPanel';
