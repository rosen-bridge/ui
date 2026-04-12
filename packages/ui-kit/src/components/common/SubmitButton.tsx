import { ReactNode } from 'react';

import { Button } from '@/components';

export type SubmitButtonProps = {
  loading: boolean;
  children: ReactNode;
  disabled?: boolean;
};

/**
 * render a submit button
 *
 * @param loading
 * @param disabled
 * @param children
 */
export const SubmitButton = ({
  loading,
  children,
  disabled,
}: SubmitButtonProps) => (
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
    loading={loading}
    disabled={disabled}
  >
    {children}
  </Button>
);
