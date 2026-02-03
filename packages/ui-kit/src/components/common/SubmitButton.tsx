import { ReactNode } from 'react';

import { LoadingButton } from '@mui/lab';

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
      width: { mobile: '100%', laptop: 'clamp(200px, 100%, 320px)' },
      display: 'flex',
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
