import { Accordion as AccordionBaseUI } from '@base-ui/react/accordion';

import { Icon, type IconProps, Transition, Typography, type TypographyProps } from '@/components';
import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

export interface AccordionHeaderOverrides {}

export type AccordionHeaderOwnProps = {
  /**
   * Props passed to the inner components.
   */
  slots?: {
    collapseIcon?: IconProps;
    expandIcon?: IconProps;
    title?: TypographyProps;
  };
};

export type AccordionHeaderBaseProps = ElementBaseProps<'h3', AccordionHeaderOwnProps>;

export type AccordionHeaderProps = OverridableType<
  AccordionHeaderBaseProps,
  AccordionHeaderOverrides,
  never
>;

export const AccordionHeader = (props: AccordionHeaderProps) => {
  const { children, slots, ...rest } = useConfig('AccordionHeader', props);

  return (
    <AccordionBaseUI.Header {...rest}>
      <AccordionBaseUI.Trigger
        className="RosenAccordionHeader-trigger"
        render={(triggerProps, { open }) => (
          <button type="button" {...triggerProps}>
            <Typography
              className="RosenAccordionHeader-title"
              variant="body1"
              {...slots?.title}
              component="span"
            >
              {children}
            </Typography>
            <Transition>
              {open ? (
                <Icon
                  key="collapse"
                  aria-hidden
                  color="text-secondary"
                  name="Minus"
                  {...slots?.collapseIcon}
                />
              ) : (
                <Icon
                  key="expand"
                  aria-hidden
                  color="text-secondary"
                  name="Plus"
                  {...slots?.expandIcon}
                />
              )}
            </Transition>
          </button>
        )}
      />
    </AccordionBaseUI.Header>
  );
};

AccordionHeader.displayName = 'AccordionHeader';
