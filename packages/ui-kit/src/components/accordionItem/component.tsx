import { Accordion as AccordionBaseUI } from '@base-ui/react/accordion';

import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

export interface AccordionItemOverrides {}

export type AccordionItemOwnProps = {
  /**
   * Whether user interaction with the item is ignored.
   */
  disabled?: boolean;
  /**
   * Unique identifier of the item, used by `value` and `defaultValue` of `Accordion`.
   */
  value?: number | string;
};

export type AccordionItemBaseProps = ElementBaseProps<'div', AccordionItemOwnProps>;

export type AccordionItemProps = OverridableType<
  AccordionItemBaseProps,
  AccordionItemOverrides,
  never
>;

export const AccordionItem = (props: AccordionItemProps) => {
  const { ...rest } = useConfig('AccordionItem', props);

  return <AccordionBaseUI.Item {...rest} />;
};

AccordionItem.displayName = 'AccordionItem';
