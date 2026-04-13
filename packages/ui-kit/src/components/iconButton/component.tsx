import { HTMLAttributeAnchorTarget } from 'react';

import { IconButton as IconButtonMUI } from '@mui/material';

import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IconButtonOverrides {}

// TODO
export type IconButtonOwnProps = {
  href?: string;
  target?: HTMLAttributeAnchorTarget;
};

export type IconButtonBaseProps = ElementBaseProps<
  typeof IconButtonMUI,
  IconButtonOwnProps
>;

export type IconButtonProps = OverridableType<
  IconButtonBaseProps,
  IconButtonOverrides,
  never
>;

export const IconButtonBase = ({ ...rest }: IconButtonProps) => {
  // TODO: extend from Button instead of MUI
  return <IconButtonMUI {...rest} />;
};

IconButtonBase.displayName = 'IconButton';

export const IconButton = Wrap(IconButtonBase);
