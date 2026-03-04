import { ComponentProps, HTMLAttributeAnchorTarget } from 'react';
import { ElementBaseProps, Root, Wrap } from '../../core';
import { OverridableType } from '../../@types';
import { IconButton as IconButtonMUI } from '@mui/material';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IconButtonOverrides { }

export type IconButtonOwnProps = {
  href?: string | undefined;
  target?: HTMLAttributeAnchorTarget | undefined;
};

export type IconButtonBaseProps = ElementBaseProps<typeof IconButtonMUI, IconButtonOwnProps>;

export type IconButtonOverriddenProps = OverridableType<
  IconButtonBaseProps,
  IconButtonOverrides,
  never
>;

export const IconButtonBase = ({ ...rest }: IconButtonOverriddenProps) => {
  // TODO: extend from Button instead of MUI
  return <Root as={IconButtonMUI} {...rest} />
};

IconButtonBase.displayName = 'IconButton';

export const IconButton = Wrap(IconButtonBase);

export type IconButtonProps = ComponentProps<typeof IconButton>;
