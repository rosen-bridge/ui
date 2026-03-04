import { ComponentProps } from 'react';
import { ElementBaseProps, Root, Wrap } from '../../core';
import { OverridableType } from '../../@types';
import { Icon, IconOverriddenProps } from '../icon';
// TODO: remove deps on MUI
import { IconButton as IconButtonMUI } from '@mui/material';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IconButtonOverrides { }

export type IconButtonOwnProps = {
  icon: IconOverriddenProps['name'];
  slots?: {
    icon?: IconOverriddenProps;
  };
};

export type IconButtonBaseProps = ElementBaseProps<typeof IconButtonMUI, IconButtonOwnProps>;

export type IconButtonOverriddenProps = OverridableType<
  IconButtonBaseProps,
  IconButtonOverrides,
  never
>;

export const IconButtonBase = ({ icon, size, slots, ...rest }: IconButtonOverriddenProps) => {
  return (
    // TODO: extend Button
    <Root as={IconButtonMUI} size={size} {...rest}>
      <Icon name={icon} size={size} {...slots?.icon} />
    </Root>
  )
};

IconButtonBase.displayName = 'IconButton';

export const IconButton = Wrap(IconButtonBase);

export type IconButtonProps = ComponentProps<typeof IconButton>;
