import { CSSProperties } from 'react';

import { Button } from '@/components';
import { ElementBaseProps, Wrap } from '@/core';
import { useResponsive } from '@/hooks';
import { OverridableType } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SubmitButtonOverrides {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type SubmitButtonOwnProps = {};

export type SubmitButtonBaseProps = ElementBaseProps<
  typeof Button,
  SubmitButtonOwnProps
>;

export type SubmitButtonProps = OverridableType<
  SubmitButtonBaseProps,
  SubmitButtonOverrides,
  never
>;

export const SubmitButtonBase = ({ style, ...rest }: SubmitButtonProps) => {
  const styles = useResponsive<CSSProperties>({
    mobile: {
      width: '100%',
      display: 'flex',
      margin: 'auto',
      ...style,
    },
    laptop: {
      width: 'clamp(200px, 100%, 320px)',
      margin: 'auto',
      ...style,
    },
  });
  return <Button style={styles} type="submit" variant="contained" {...rest} />;
};

SubmitButtonBase.displayName = 'SubmitButton';

export const SubmitButton = Wrap(SubmitButtonBase);
