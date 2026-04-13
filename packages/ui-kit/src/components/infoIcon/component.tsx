import { Icon, Tooltip, TooltipProps } from '@/components';
import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface InfoIconOverrides {}

export type InfoIconOwnProps = {
  info?: TooltipProps['title'];
  slots?: {
    tooltip?: TooltipProps;
  };
};

export type InfoIconBaseProps = ElementBaseProps<typeof Icon, InfoIconOwnProps>;

export type InfoIconProps = OverridableType<
  InfoIconBaseProps,
  InfoIconOverrides,
  never
>;

export const InfoIconBase = ({ info, slots, ...rest }: InfoIconProps) => {
  return (
    <Tooltip title={info} {...slots?.tooltip}>
      <Icon name="ExclamationCircle" size="16px" {...rest} />
    </Tooltip>
  );
};

InfoIconBase.displayName = 'InfoIcon';

export const InfoIcon = Wrap(InfoIconBase);
