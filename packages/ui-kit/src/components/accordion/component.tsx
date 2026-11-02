import { Accordion as AccordionBaseUI } from '@base-ui/react/accordion';

import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

export interface AccordionOverrides {}

export type AccordionOwnProps = {
  /**
   * Values of the items that are initially open, when uncontrolled.
   */
  defaultValue?: (number | string)[];
  /**
   * Whether user interaction with all items is ignored.
   */
  disabled?: boolean;
  /**
   * Whether several items can be open at the same time.
   */
  multiple?: boolean;
  /**
   * Called when an item opens or closes.
   */
  onChange?: (value: (number | string)[]) => void;
  /**
   * Values of the items that are open, when controlled.
   */
  value?: (number | string)[];
};

export type AccordionBaseProps = ElementBaseProps<'div', AccordionOwnProps>;

export type AccordionProps = OverridableType<AccordionBaseProps, AccordionOverrides, never>;

export const Accordion = (props: AccordionProps) => {
  const { onChange, ...rest } = useConfig('Accordion', props);

  return <AccordionBaseUI.Root onValueChange={(value) => onChange?.(value)} {...rest} />;
};

Accordion.displayName = 'Accordion';
