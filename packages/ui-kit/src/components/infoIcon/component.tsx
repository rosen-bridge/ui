import { ComponentProps } from 'react';

import { OverridableType } from '@/types';
import { Icon, Tooltip, TooltipOverriddenProps } from '@/components';
import { ElementBaseProps, Root, Wrap } from '@/core';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface InfoIconOverrides {}

export type InfoIconOwnProps = {
  info?: TooltipOverriddenProps['title'];
  slots?: {
    tooltip?: TooltipOverriddenProps;
  };
};

export type InfoIconBaseProps = ElementBaseProps<typeof Icon, InfoIconOwnProps>;

export type InfoIconOverriddenProps = OverridableType<
  InfoIconBaseProps,
  InfoIconOverrides,
  never
>;

export const InfoIconBase = ({
  info,
  slots,
  ...rest
}: InfoIconOverriddenProps) => {
  return (
    <Tooltip title={info} {...slots?.tooltip}>
      <Root as={Icon} name="ExclamationCircle" size="16px" {...rest} />
    </Tooltip>
  );
};

InfoIconBase.displayName = 'InfoIcon';

export const InfoIcon = Wrap(InfoIconBase);

export type InfoIconProps = ComponentProps<typeof InfoIcon>;
