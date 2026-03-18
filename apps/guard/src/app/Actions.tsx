import {
  Toolbar,
  ThemeToggleButton,
  useIsMobile,
  ApiKeyDialogButton,
} from '@rosen-bridge/ui-kit';

import { VersionConfig } from './VersionConfig';

export const Actions = ({ sidebar }: { sidebar?: boolean }) => {
  const isMobile = useIsMobile();

  if (isMobile && !sidebar) return null;

  return (
    <Toolbar>
      {sidebar && <VersionConfig />}
      {((sidebar && isMobile) || (!sidebar && !isMobile)) && <ApiKeyDialogButton />}
      {((sidebar && isMobile) || (!sidebar && !isMobile)) && <ThemeToggleButton />}
    </Toolbar>
  );
};
