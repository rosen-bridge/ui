import { HTMLAttributeAnchorTarget } from 'react';

import { IconButton as IconButtonMUI } from '@mui/material';

import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

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

export const IconButton = (props: IconButtonProps) => {
  const { ...rest } = useConfig('IconButton', props);

  // TODO: extend from Button instead of MUI
  return <IconButtonMUI {...rest} />;
};

IconButton.displayName = 'IconButton';
