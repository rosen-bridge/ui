import { Button } from '@/components';
import { ElementBaseProps, Wrap } from '@/core';
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

export const SubmitButtonBase = ({ ...rest }: SubmitButtonProps) => {
  return (
    <Button
      style={{
        width: '100%',
        display: 'flex',
        margin: 'auto',
      }}
      rewrite={{
        laptop: {
          style: {
            width: 'clamp(200px, 100%, 320px)',
            margin: 'auto',
          },
        },
      }}
      variant="contained"
      type="submit"
      {...rest}
    />
  );
};

SubmitButtonBase.displayName = 'SubmitButton';

export const SubmitButton = Wrap(SubmitButtonBase);
