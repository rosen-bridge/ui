import { Icon, Tooltip, TooltipProps } from '@/components';
import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

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

export const InfoIcon = (props: InfoIconProps) => {
  const { info, slots, ...rest } = useConfig('InfoIcon', props);

  return (
    <Tooltip title={info} {...slots?.tooltip}>
      <Icon name="ExclamationCircle" size="16px" {...rest} />
    </Tooltip>
  );
};

InfoIcon.displayName = 'InfoIcon';
