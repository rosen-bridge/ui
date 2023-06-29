import { ReactNode } from 'react';

import { LoadingButton } from '@rosen-bridge/ui-kit';

interface SubmitButtonProps {
  loading: boolean;
  children: ReactNode;
}
/**
 * render a submit button to be used in actions page
 *
 * @param loading
 * @param children
 */
const SubmitButton = ({ loading, children }: SubmitButtonProps) => (
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

export default SubmitButton;
