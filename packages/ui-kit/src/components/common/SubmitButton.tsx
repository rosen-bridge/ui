import { ReactNode } from 'react';

import { LoadingButton } from '../base';

export interface SubmitButtonProps {
  loading: boolean;
  children: ReactNode;
}
/**
 * render a submit button
 *
 * @param loading
 * @param children
 */
export const SubmitButton = ({ loading, children }: SubmitButtonProps) => (
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
  >
    {children}
  </LoadingButton>
);
