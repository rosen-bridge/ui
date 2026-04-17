import {
  Toolbar,
  ThemeToggleButton,
  ApiKeyDialogButton,
  useBreakpoint,
} from '@rosen-bridge/ui-kit';

import { VersionConfig } from './VersionConfig';

export const Actions = ({ sidebar }: { sidebar?: boolean }) => {
  const isTabletDown = useBreakpoint('tablet-down');

  if (isTabletDown && !sidebar) return null;

  return (
    <Toolbar>
      {sidebar && <VersionConfig />}
      {((sidebar && isTabletDown) || (!sidebar && !isTabletDown)) && (
        <ApiKeyDialogButton />
      )}
      {((sidebar && isTabletDown) || (!sidebar && !isTabletDown)) && (
        <ThemeToggleButton />
      )}
    </Toolbar>
  );
};
