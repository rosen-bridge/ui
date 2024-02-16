import { ReactNode } from 'react';

import { LoadingButton } from '../base';

export interface SubmitButtonProps {
  loading: boolean;
  children: ReactNode;
  disabled?: boolean;
}
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
  <LoadingButton
    sx={{
      width: { mobile: '100%', laptop: '50%' },
      display: 'flex',
      mt: 3,
      mx: 'auto',
    }}
    variant="contained"
    type="submit"
    loading={loading}
    disabled={disabled}
  >
    {children}
  </LoadingButton>
);
